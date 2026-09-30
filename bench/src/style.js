/**
 * Bounded .ink style checks for design tasks, not a browser CSS engine.
 * Supports flat class selectors (including comma lists), source-order
 * declarations, and literal inline longhands. Tasks explicitly request this
 * syntax. Unsupported selectors, at-rules, shorthands, and dynamic styles
 * fail closed rather than silently hiding an override.
 */
const shorthands = new Set(['background', 'border', 'border-top', 'border-right',
  'border-bottom', 'border-left', 'font', 'padding', 'margin',
  'all', 'flex', 'gap']);

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
    .replace(/([,(])0\./g, '$1.')
    .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])(?![0-9a-f])/g, '#$1$1$2$2$3$3');
}

function declarations(body) {
  const result = {};
  for (const part of body.split(';').filter(value => value.trim())) {
    const match = part.trim().match(/^([a-z][a-z-]*)\s*:\s*([^{};]+)$/i);
    if (!match || shorthands.has(match[1].toLowerCase())
      || /!important|var\(|\{\{|inherit|initial|unset|revert/i.test(match[2])) return null;
    result[match[1].toLowerCase()] = normalize(match[2]);
  }
  return result;
}

/** Require declarations on real template nodes, ignoring script/comment decoys. */
export function matchesStyle(source, check) {
  const clean = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const template = clean.match(/<(page|widget)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2];
  if (!template) return false;
  const sheets = [...clean.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  if (!sheets.length) return false;
  const css = sheets.map(match => match[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  let end = 0;
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (css.slice(end, match.index).trim()) return false;
    const selectors = match[1].split(',').map(value => value.trim());
    if (selectors.some(selector => !/^\.[a-zA-Z_][\w-]*$/.test(selector))) return false;
    const values = declarations(match[2]);
    if (!values) return false;
    rules.push({ classes: selectors.map(selector => selector.slice(1)), values });
    end = match.index + match[0].length;
  }
  if (css.slice(end).trim()) return false;

  let count = 0;
  for (const match of template.matchAll(/<([a-z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)) {
    const attributes = Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)]
      .map(attribute => [attribute[1].toLowerCase(), attribute[3]]));
    const classes = (attributes.class || '').split(/\s+/);
    if (!classes.includes(check.className)) continue;
    if (/[{}]/.test(attributes.class || '')) return false;
    if (check.tag && match[1].toLowerCase() !== check.tag) return false;
    // Text/binding roles are intended for leaf text/button nodes.
    const content = template.slice(match.index + match[0].length).split(new RegExp(`</${match[1]}\\s*>`, 'i'))[0];
    if (check.text && !content.includes(check.text)) return false;
    if (check.binding && ![...content.matchAll(/\{\{([^}]*)\}\}/g)]
      .some(binding => binding[1].trim() === check.binding)) return false;
    const actual = {};
    for (const rule of rules) {
      if (rule.classes.some(name => classes.includes(name))) Object.assign(actual, rule.values);
    }
    if (attributes.style !== undefined) {
      const inline = declarations(attributes.style);
      if (!inline) return false;
      Object.assign(actual, inline);
    }
    if (!Object.entries(check.declarations).every(([property, value]) => actual[property] === normalize(value))) return false;
    count += 1;
  }
  return count >= (check.minCount || 1);
}
