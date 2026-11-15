# Introduction

WXML (WeiXin Markup Language) is a tag language designed by the framework. Combined with base components and the event system, it can be used to build the structure of a page.

AIUI supports a WXML subset similar to WeChat Mini Programs. These examples show common page structure and data usage:

## Data Binding

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

## Conditional Rendering

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

## List Rendering

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

## Reuse an Interface

To use the same interface in multiple places, create a [custom component](/AIUI/framework/open-agent-format-custom-components). A single-file interface with incremental update support can also use [region updates](/AIUI/framework/wxml-template) to add content as it arrives.
