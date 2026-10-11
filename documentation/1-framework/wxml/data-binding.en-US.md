# Data Binding

All dynamic data in WXML comes from the `data` of the corresponding Page.

## Simple Binding

Data binding uses Mustache syntax (double curly braces) to wrap variables, and it can be applied to:

### Content
```html
<view> {{ message }} </view>
```

```javascript
export default {
  data: {
    message: 'Hello MINA!'
  }
}
```

### Component Attributes (must be inside double quotes)
```html
<view id="item-{{id}}"> </view>
```

```javascript
export default {
  data: {
    id: 0
  }
}
```

### Control Attributes (must be inside double quotes)
```html
<view ink:if="{{condition}}"> </view>
```

```javascript
export default {
  data: {
    condition: true
  }
}
```

### Keywords (must be inside double quotes)
`true`: Boolean `true`, representing a truthy value.
`false`: Boolean `false`, representing a falsy value.

```html
<checkbox checked="{{false}}"> </checkbox>
```

*Important: do not write `checked="false"` directly. Its result is a string, which becomes truthy after being converted to a boolean.*

## Expressions

Simple expressions can be written inside `{{}}`. The following forms are supported:

### Ternary Expressions
```html
<view hidden="{{flag ? true : false}}"> Hidden </view>
```

### Arithmetic Expressions
```html
<view> {{a + b}} + {{c}} + d </view>
```
```javascript
export default {
  data: {
    a: 1,
    b: 2,
    c: 3
  }
}
```
The content in the view is `3 + 3 + d`.

### Logical Conditions
```html
<view ink:if="{{length > 5}}"> </view>
```

### String Expressions
```html
<view>{{"hello" + name}}</view>
```
```javascript
export default {
  data:{
    name: 'MINA'
  }
}
```

### Data Path Expressions
```html
<view>{{object.key}} {{array[0]}}</view>
```
```javascript
export default {
  data: {
    object: {
      key: 'Hello '
    },
    array: ['MINA']
  }
}
```

## Composition

You can also compose values directly inside Mustache syntax to form new objects or arrays.

### Arrays
```html
<view ink:for="{{[zero, 1, 2, 3, 4]}}"> {{item}} </view>
```
```javascript
export default {
  data: {
    zero: 0
  }
}
```
The final composed array is `[0, 1, 2, 3, 4]`.

### Objects
```html
<template is="objectCombine" data="{{for: a, bar: b}}"></template>
```
```javascript
export default {
  data: {
    a: 1,
    b: 2
  }
}
```
The final composed object is `{for: 1, bar: 2}`

You can also use the spread operator `...` to expand an object.
```html
<template is="objectCombine" data="{{...obj1, ...obj2, e: 5}}"></template>
```
```javascript
export default {
  data: {
    obj1: {
      a: 1,
      b: 2
    },
    obj2: {
      c: 3,
      d: 4
    }
  }
}
```
The final composed object is `{a: 1, b: 2, c: 3, d: 4, e: 5}`.

If the key and value of an object are the same, you can also use the shorthand form.
```html
<template is="objectCombine" data="{{foo, bar}}"></template>
```
```javascript
export default {
  data: {
    foo: 'my-foo',
    bar: 'my-bar'
  }
}
```
The final composed object is `{foo: 'my-foo', bar:'my-bar'}`.

**Note: the methods above can be combined freely, but if duplicate variable names exist, the later ones override the earlier ones. For example:**
```html
<template is="objectCombine" data="{{...obj1, ...obj2, a: c}}"></template>
```
```javascript
export default {
  data: {
    obj1: {
      a: 1,
      b: 2
    },
    obj2: {
      b: 3,
      c: 4
    },
    a: 5
  }
}
```
The final composed object is `{a: 5, b: 3, c: 4}`.

*Note: if there are spaces between the curly braces and the quotation marks, the result will be parsed as a string.*

## Continue updating in a callback

A `setData(patch, callback)` callback can call `setData()` again. Query current nodes in the callback when your work depends on the update. Patch only changed fields to reduce binding and layout work.
