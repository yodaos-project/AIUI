# 介绍

WXML（WeiXin Markup Language）是框架设计的一套标签语言，结合基础组件、事件系统，可以构建出页面的结构。

AIUI 支持与微信小程序相似的 WXML 子集。下面的例子展示常用的页面结构和数据用法：

## 数据绑定

```html
<!--wxml-->
<view> {{message}} </view>
```

```javascript
// page.js
export default {
  data: {
    message: 'Hello MINA!'
  }
}
```

## 条件渲染

```html
<!--wxml-->
<view ink:if="{{view == 'WEBVIEW'}}"> WEBVIEW </view>
<view ink:elif="{{view == 'APP'}}"> APP </view>
<view ink:else> MINA </view>
```

```javascript
// page.js
export default {
  data: {
    view: 'MINA'
  }
}
```

## 列表渲染

```html
<!--wxml-->
<view ink:for="{{array}}"> {{item}} </view>
```

```javascript
// page.js
export default {
  data: {
    array: [1, 2, 3, 4, 5]
  }
}
```

## 复用界面

需要在多个位置使用同一段界面时，可以创建[自定义组件](/AIUI/framework/open-agent-format-custom-components)。对于支持增量更新的单文件界面，也可以使用[区域更新](/AIUI/framework/wxml-template)逐步补充内容。
