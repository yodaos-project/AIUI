/**
 * Bounded source-level .ink style checks. Supports static selectors, cascade,
 * inherited text properties/custom properties, and common design shorthands.
 * This is not a layout or rendering engine; unsupported syntax fails closed.
 */
const sides = ['top', 'right', 'bottom', 'left'];
const corners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
const inherited = ['color', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-transform'];

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
    .replace(/([,(])0\./g, '$1.')
    .replace(/^0(?:px)?$/, '0')
    .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])(?![0-9a-f])/g, '#$1$1$2$2$3$3');
}

function tokens(value) {
  return value.match(/(?:[^\s(]+\([^)]*\)|[^\s]+)/g) || [];
}

function four(values) {
  if (!values.length || values.length > 4) return null;
  return [values[0], values[1] || values[0], values[2] || values[0], values[3] || values[1] || values[0]];
}

/** Expand the properties used by design tasks, retaining declaration order. */
function expand(property, value) {
  const result = {};
  if (['padding', 'margin', 'border-width', 'border-style', 'border-color', 'border-radius'].includes(property)) {
    const values = four(tokens(value));
    if (!values || value.includes('/')) return null;
    for (let index = 0; index < 4; index++) {
      const key = property === 'border-radius' ? `border-${corners[index]}-radius`
        : property.startsWith('border-') ? `border-${sides[index]}-${property.slice(7)}` : `${property}-${sides[index]}`;
      result[key] = normalize(values[index]);
    }
  } else if (/^border(?:-(?:top|right|bottom|left))?$/.test(property)) {
    let width = 'medium', style = 'none', color = 'currentcolor';
    for (const token of tokens(value)) {
      if (/^(?:\d+(?:\.\d+)?(?:px)?|thin|medium|thick)$/.test(token)) width = token;
      else if (/^(?:none|solid|dashed|dotted|double)$/.test(token)) style = token;
      else color = token;
    }
    for (const side of property === 'border' ? sides : [property.slice(7)]) {
      result[`border-${side}-width`] = normalize(width);
      result[`border-${side}-style`] = normalize(style);
      result[`border-${side}-color`] = normalize(color);
    }
  } else if (property === 'background') {
    if (!/^(?:#[\da-f]+|rgba?\([^)]*\)|transparent|black)$/i.test(value.trim())) return null;
    result['background-color'] = normalize(value);
  } else if (property === 'font') {
    const match = value.match(/^(?:(\d{3}|normal|bold)\s+)?(\d+(?:\.\d+)?px)(?:\s*\/\s*([\d.]+(?:px)?))?\s+(sans-serif|monospace|serif)$/i);
    if (!match) return null;
    result['font-weight'] = match[1] === 'bold' ? '700' : match[1] === 'normal' || !match[1] ? '400' : match[1];
    result['font-size'] = normalize(match[2]);
    result['line-height'] = match[3] ? normalize(match[3]) : 'normal';
    result['font-family'] = normalize(match[4]);
  } else {
    result[property] = normalize(value);
  }
  return result;
}

function declarations(body) {
  const result = [];
  for (const part of body.split(';').filter(value => value.trim())) {
    const match = part.trim().match(/^(--[\w-]+|[a-z][a-z-]*)\s*:\s*([^{};]+)$/i);
    if (!match || /\{\{|\b(?:initial|unset|revert)\b/i.test(match[2]) || match[1] === 'all') return null;
    result.push({ property: match[1], value: match[2].replace(/\s*!important\s*$/i, ''), important: /!important\s*$/i.test(match[2]) });
  }
  return result;
}

function selectorParts(selector) {
  const parts = selector.trim().split(/\s+/);
  const supported = parts.every(part => part === ':root'
    || (part.length > 0 && /^(?:[a-z][\w-]*|\*)?(?:[.#][a-zA-Z_][\w-]*)*$/.test(part)));
  return supported ? parts : null;
}

function matchesPart(part, node) {
  if (part === ':root') return node.parent === null;
  const tag = part.match(/^[a-z][\w-]*/)?.[0];
  if (tag && tag !== node.tag) return false;
  return [...part.matchAll(/([.#])([\w-]+)/g)].every(([, kind, name]) =>
    kind === '.' ? node.classes.includes(name) : node.attributes.id === name);
}

function matchesSelector(parts, node) {
  if (!matchesPart(parts.at(-1), node)) return false;
  let ancestor = node.parent;
  for (let index = parts.length - 2; index >= 0; index--) {
    while (ancestor && !matchesPart(parts[index], ancestor)) ancestor = ancestor.parent;
    if (!ancestor) return false;
    ancestor = ancestor.parent;
  }
  return true;
}

function resolve(value, variables, trail = []) {
  return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]+))?\)/g, (_, key, fallback) => {
    if (trail.includes(key)) throw new Error('cyclic style variable');
    const replacement = variables[key] ?? fallback;
    if (replacement === undefined) throw new Error('unknown style variable');
    return resolve(replacement, variables, [...trail, key]);
  });
}

/** Compute checked declarations on actual template nodes, ignoring decoys. */
export function matchesStyle(source, check) {
  try { return evaluateStyle(source, check); } catch { return false; }
}

function evaluateStyle(source, check) {
  const clean = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const template = clean.match(/<(page|widget)\b[^>]*>[\s\S]*?<\/\1>/i)?.[0];
  if (!template) return false;
  const sheets = [...clean.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  if (!sheets.length) return false;
  const css = sheets.map(match => match[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  let end = 0;
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (css.slice(end, match.index).trim()) return false;
    const values = declarations(match[2]);
    if (!values) return false;
    for (const selector of match[1].split(',')) {
      const parts = selectorParts(selector);
      if (!parts) return false;
      const specificity = (selector.match(/#/g)?.length || 0) * 100
        + (selector.match(/\.|:root/g)?.length || 0) * 10
        + parts.filter(part => /^[a-z]/.test(part)).length;
      rules.push({ parts, values, specificity });
    }
    end = match.index + match[0].length;
  }
  if (css.slice(end).trim()) return false;

  const stack = [], nodes = [];
  for (const match of template.matchAll(/<\/?([a-z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)) {
    if (match[0].startsWith('</')) {
      const node = stack.pop();
      if (!node || node.tag !== match[1]) return false;
      node.content = template.slice(node.start, match.index);
      continue;
    }
    const attributes = Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)]
      .map(attribute => [attribute[1].toLowerCase(), attribute[3]]));
    if (/[{}]/.test(attributes.class || '') || /\{\{/.test(attributes.style || '')) return false;
    const node = { tag: match[1], attributes, classes: (attributes.class || '').split(/\s+/), parent: stack.at(-1) || null,
      start: match.index + match[0].length, content: '' };
    nodes.push(node);
    if (!/\/\s*>$/.test(match[0])) stack.push(node);
  }
  if (stack.length) return false;

  const expected = Object.assign({}, ...Object.entries(check.declarations).map(([property, value]) => expand(property, value)));
  let count = 0;
  for (const node of nodes) {
    const inheritedValues = Object.fromEntries(inherited.filter(property => node.parent?.computed[property] !== undefined)
      .map(property => [property, node.parent.computed[property]]));
    const variables = { ...node.parent?.variables }, winners = {};
    const matched = rules.filter(rule => matchesSelector(rule.parts, node));
    if (node.attributes.style !== undefined) {
      const values = declarations(node.attributes.style);
      if (!values) return false;
      matched.push({ values, specificity: 1000 });
    }
    // Custom properties cascade before values are resolved, regardless of declaration order.
    for (const custom of [true, false]) {
      for (const rule of matched) for (const declaration of rule.values) {
        if (declaration.property.startsWith('--') !== custom) continue;
        const values = custom ? { [declaration.property]: declaration.value }
          : expand(declaration.property, resolve(declaration.value, variables));
        if (!values) return false;
        const priority = (declaration.important ? 10000 : 0) + rule.specificity;
        for (const [property, value] of Object.entries(values)) {
          if (!winners[property] || priority >= winners[property].priority) {
            winners[property] = { value, priority };
            if (custom) variables[property] = value;
          }
        }
      }
    }
    node.variables = variables;
    node.computed = { ...inheritedValues, ...Object.fromEntries(Object.entries(winners).map(([property, winner]) =>
      [property, winner.value === 'inherit' ? node.parent?.computed[property] : winner.value])) };
    if (!node.classes.includes(check.className)) continue;
    if (check.tag && node.tag !== check.tag) return false;
    if (check.text && !node.content.includes(check.text)) return false;
    if (check.binding && ![...node.content.matchAll(/\{\{([^}]*)\}\}/g)].some(binding => binding[1].trim() === check.binding)) return false;
    if (!Object.entries(expected).every(([property, value]) => node.computed[property] === value)) return false;
    count++;
  }
  return count >= (check.minCount || 1);
}
