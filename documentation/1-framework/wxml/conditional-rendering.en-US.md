# Conditional Rendering

## ink:if

In the framework, `ink:if=""` is used to determine whether this code block should be rendered:

```html
<view ink:if="{{condition}}"> True </view>
```

You can also use `ink:elif` and `ink:else` to add an else block:

```html
<view ink:if="{{length > 5}}"> 1 </view>
<view ink:elif="{{length > 2}}"> 2 </view>
<view ink:else> 3 </view>
```

## block ink:if

Because `ink:if` is a control attribute, it needs to be added to a tag. If you want to evaluate multiple component tags at once, you can wrap them in a `<block/>` tag and use the `ink:if` control attribute on it.

```html
<block ink:if="{{true}}">
  <view> view1 </view>
  <view> view2 </view>
</block>
```

**Note:** `<block/>` is not a component. It is only a wrapper element, does not render anything on the page, and only accepts control attributes.

## `ink:if` vs `hidden`

Because the template inside `ink:if` may also contain data binding, when the condition value of `ink:if` changes, the framework performs a partial rendering process to ensure that the conditional block is destroyed or re-rendered during switching.

At the same time, `ink:if` is lazy. If the initial render condition is `false`, the framework does nothing and only starts partial rendering when the condition becomes true for the first time.

In contrast, `hidden` is much simpler. The component is always rendered, and only its visibility is controlled.

In general, `ink:if` has a higher switching cost, while `hidden` has a higher initial rendering cost. Therefore, `hidden` is better for scenarios that need frequent toggling, while `ink:if` is better when the runtime condition is unlikely to change.

## Conditional nodes and hidden state

Keep `ink:if` / `ink:elif` / `ink:else` branches adjacent. Inactive branches are absent from the current rendered tree. `hidden` retains the node and controls visibility. Bind a boolean, such as `hidden="{{isHidden}}"`, rather than treating a string as boolean state.

Conditions inside loops use the current item scope; see [List rendering](/AIUI/framework/wxml-list-rendering). After updating conditions or `hidden`, use current nodes and bound values for selectors and events.
