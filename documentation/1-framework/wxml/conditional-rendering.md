# 条件渲染

## ink:if

在框架中，使用 `ink:if=""` 来判断是否需要渲染该代码块：

```html
<view ink:if="{{condition}}"> True </view>
```

也可以用 `ink:elif` 和 `ink:else` 来添加一个 else 块：

```html
<view ink:if="{{length > 5}}"> 1 </view>
<view ink:elif="{{length > 2}}"> 2 </view>
<view ink:else> 3 </view>
```

## block ink:if

因为 `ink:if` 是一个控制属性，需要将它添加到一个标签上。如果要一次性判断多个组件标签，可以使用一个 `<block/>` 标签将多个组件包装起来，并在上边使用 `ink:if` 控制属性。

```html
<block ink:if="{{true}}">
  <view> view1 </view>
  <view> view2 </view>
</block>
```

**注意：** `<block/>` 并不是一个组件，它仅仅是一个包装元素，不会在页面中做任何渲染，只接受控制属性。

## `ink:if` vs `hidden`

因为 `ink:if` 之中的模板也可能包含数据绑定，所以当 `ink:if` 的条件值切换时，框架有一个局部渲染的过程，因为它会确保条件块在切换时销毁或重新渲染。

同时 `ink:if` 也是惰性的，如果在初始渲染条件为 `false`，框架什么也不做，在条件第一次变成真的时候才开始局部渲染。

相比之下，`hidden` 就简单的多，组件始终会被渲染，只是简单的控制显示与隐藏。

一般来说，`ink:if` 有更高的切换消耗而 `hidden` 有更高的初始渲染消耗。因此，如果需要频繁切换的情景下，用 `hidden` 更好，如果在运行时条件不大可能改变则 `ink:if` 较好。

## 条件节点与隐藏状态

`ink:if` / `ink:elif` / `ink:else` 的条件分支应相邻；不满足的分支不保留在当前渲染树中。`hidden` 保留节点并控制可见性。使用布尔绑定，例如 `hidden="{{isHidden}}"`，避免把字符串当作布尔状态。

循环内的条件在当前项作用域求值，见[列表渲染](/AIUI/framework/wxml-list-rendering)。更新条件或 `hidden` 后，选择器与事件应使用当前节点和绑定值。
