# 数据绑定

WXML 中的动态数据均来自对应 Page 的 `data`。

## 简单绑定

数据绑定使用 Mustache 语法（双大括号）将变量包起来，可以作用于：

### 内容
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

### 组件属性(需要在双引号之内)
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

### 控制属性(需要在双引号之内)
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

### 关键字(需要在双引号之内)
`true`：boolean 类型的 true，代表真值。
`false`： boolean 类型的 false，代表假值。

```html
<checkbox checked="{{false}}"> </checkbox>
```

*特别注意：不要直接写 `checked="false"`，其计算结果是一个字符串，转成 boolean 类型后代表真值。*

## 运算

可以在 `{{}}` 内进行简单的运算，支持的有如下几种方式：

### 三元运算
```html
<view hidden="{{flag ? true : false}}"> Hidden </view>
```

### 算数运算
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
view中的内容为 `3 + 3 + d`。

### 逻辑判断
```html
<view ink:if="{{length > 5}}"> </view>
```

### 字符串运算
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

### 数据路径运算
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

## 组合

可以在绑定中组合数组；需要组合对象时，使用页面逻辑。

### 数组
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
最终组合成数组 `[0, 1, 2, 3, 4]`。

### 对象

需要更新对象中的字段时，先在页面逻辑中构造新对象，再通过 `setData()` 更新：

```html
<text>{{profile.name}}，{{profile.city}}</text>
```

```javascript
export default {
  data: { profile: { name: '小明', city: '杭州' } },
  moveToShanghai() {
    this.setData({ profile: { ...this.data.profile, city: '上海' } });
  },
};
```

对象展开语法在 JavaScript 中执行；不要使用 `<template name>` / `<template is>` 传递对象，它们当前不支持。需要复用界面时，请使用[自定义组件](/AIUI/framework/open-agent-format-custom-components)。

## 在回调中继续更新

`setData(patch, callback)` 的回调中可以再次调用 `setData()`。需要在更新后查询节点时，请在回调中使用当前选择器结果。只更新发生变化的字段，可减少绑定与布局工作。
