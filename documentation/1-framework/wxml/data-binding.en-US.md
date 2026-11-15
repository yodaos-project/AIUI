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

You can compose arrays in bindings. Compose objects in the page logic.

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

To update an object field, create a new object in the page logic and pass it to `setData()`:

```html
<text>{{profile.name}}, {{profile.city}}</text>
```

```javascript
export default {
  data: { profile: { name: 'Alex', city: 'Hangzhou' } },
  moveToShanghai() {
    this.setData({ profile: { ...this.data.profile, city: 'Shanghai' } });
  },
};
```

The object spread runs in JavaScript. Do not pass objects with `<template name>` / `<template is>`; these forms are not currently supported. To reuse an interface, use a [custom component](/AIUI/framework/open-agent-format-custom-components).

## Continue updating in a callback

A `setData(patch, callback)` callback can call `setData()` again. Query current nodes in the callback when your work depends on the update. Patch only changed fields to reduce binding and layout work.
