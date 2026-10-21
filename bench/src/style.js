/**
 * Bounded source-level .ink style checks. Supports static selectors, cascade,
 * inherited text properties/custom properties, and common design shorthands.
 * This is not a layout or rendering engine; unsupported syntax is unverified.
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

/** Split balanced CSS blocks without treating braces inside strings as syntax. */
function stylesheetVariants(css) {
  let variants = [''];
  let offset = 0;
  while (offset < css.length) {
    if (!css.slice(offset).trim()) break;
    const start = offset;
    let quote = '', parentheses = 0;
    for (; offset < css.length; offset++) {
      const char = css[offset];
      if (quote) { if (char === '\\') offset++; else if (char === quote) quote = ''; }
      else if (char === '"' || char === "'") quote = char;
      else if (char === '(') parentheses++;
      else if (char === ')') parentheses--;
      else if (!parentheses && (char === '{' || char === ';')) break;
    }
    if (css[offset] !== '{') throw new Error('stylesheet imports or unsupported rule syntax');
    const selector = css.slice(start, offset).trim();
    const bodyStart = ++offset;
    let depth = 1;
    quote = '';
    for (; offset < css.length && depth; offset++) {
      const char = css[offset];
      if (quote) { if (char === '\\') offset++; else if (char === quote) quote = ''; }
      else if (char === '"' || char === "'") quote = char;
      else if (char === '{') depth++;
      else if (char === '}') depth--;
    }
    if (depth) throw new Error('unclosed stylesheet block');
    const body = css.slice(bodyStart, offset - 1);
    if (/^@media\b/i.test(selector)) {
      // Without a rendered viewport, prove a property only if it agrees for
      // every media branch. Never silently discard a potentially overriding rule.
      const branches = stylesheetVariants(body);
      variants = variants.flatMap(prefix => [prefix, ...branches.map(branch => prefix + branch)]);
      if (variants.length > 32) throw new Error('too many conditional style branches');
    } else if (/^@(?:[-\w]*keyframes|font-face)\b/i.test(selector)) {
      // These definitions do not contribute to the default-state cascade.
    } else if (selector.startsWith('@')) throw new Error('unsupported stylesheet at-rule');
    else {
      const selectors = selector.split(',').map(value => value.trim());
      const base = selectors.filter(value => !/:(?:active|hover|focus)\b/.test(value));
      if (base.length) variants = variants.map(prefix => `${prefix}${base.join(',')}{${body}}\n`);
    }
  }
  return variants;
}

/**
 * Check default-state source declarations. Conditional disagreement and syntax
 * outside this bounded cascade return passed:null, never a fabricated failure
 * or a pass. Runtime animation, focus, and actual layout need separate evidence.
 */
export function checkStyle(source, check) {
  try {
    const clean = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const css = [...clean.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
      .map(match => match[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
    const results = stylesheetVariants(css).map(variant => evaluateStyle(source, check, variant));
    if (results.every(Boolean)) return { passed: true };
    if (results.every(value => !value)) return { passed: false, message: 'style declarations do not match' };
    return { passed: null, message: 'style depends on a media condition; rendered viewport verification is required' };
  } catch (error) {
    return { passed: null, message: `style not verified: ${error.message}` };
  }
}

/** Boolean compatibility helper; unverified styles never count as passed. */
export function matchesStyle(source, check) {
  return checkStyle(source, check).passed === true;
}

function evaluateStyle(source, check, css) {
  const clean = source.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const template = clean.match(/<(page|widget)\b[^>]*>[\s\S]*?<\/\1>/i)?.[0];
  if (!template) return false;
  const sheets = [...clean.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)];
  if (!sheets.length) return false;
  const rules = [];
  let end = 0;
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (css.slice(end, match.index).trim()) throw new Error('unsupported style block');
    const values = declarations(match[2]);
    if (!values) throw new Error('unsupported style declaration');
    for (const selector of match[1].split(',')) {
      const parts = selectorParts(selector);
      if (!parts) throw new Error('unsupported selector');
      const specificity = (selector.match(/#/g)?.length || 0) * 100
        + (selector.match(/\.|:root/g)?.length || 0) * 10
        + parts.filter(part => /^[a-z]/.test(part)).length;
      rules.push({ parts, values, specificity });
    }
    end = match.index + match[0].length;
  }
  if (css.slice(end).trim()) throw new Error('unsupported style syntax');

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
    if (/[{}]/.test(attributes.class || '') || /\{\{/.test(attributes.style || '')) throw new Error('dynamic class or inline style');
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
