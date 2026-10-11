# List Rendering

## ink:for

Use the `ink:for` control attribute on a component to bind an array, and the component will be rendered repeatedly with each item in the array.

By default, the index variable name of the current array item is `index`, and the variable name of the current item is `item`

```html
<view ink:for="{{array}}">
  {{index}}: {{item.message}}
</view>
```

```javascript
export default {
  data: {
    array: [{
      message: 'foo',
    }, {
      message: 'bar'
    }]
  }
}
```

Use `ink:for-item` to specify the variable name of the current array item.

Use `ink:for-index` to specify the variable name of the current array index:

```html
<view ink:for="{{array}}" ink:for-index="idx" ink:for-item="itemName">
  {{idx}}: {{itemName.message}}
</view>
```

`ink:for` can also be nested. The following example is a multiplication table:

```html
<view ink:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" ink:for-item="i">
  <view ink:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" ink:for-item="j">
    <view ink:if="{{i <= j}}">
      {{i}} * {{j}} = {{i * j}}
    </view>
  </view>
</view>
```

## block ink:for

Similar to `block ink:if`, `ink:for` can also be used on a `<block/>` tag to render a structure block containing multiple nodes. For example:

```html
<block ink:for="{{[1, 2, 3]}}">
  <view> {{index}}: </view>
  <view> {{item}} </view>
</block>
```

## ink:key

If the positions of items in the list may change dynamically, or new items may be added to the list, and you want the items in the list to preserve their own identity and state, such as the input content in an input or the selected state of a switch, you need to use `ink:key` to specify a unique identifier for each item in the list.

The value of `ink:key` is provided in two forms

1. A string, representing a property of the item in the for-loop `array`. The value of this property must be a unique string or number in the list and must not change dynamically.
2. The reserved keyword `*this`, representing the item itself in the for loop. In this case, the item itself must be a unique string or number.

When data changes and causes the rendering layer to re-render, keyed components are reconciled. The framework ensures they are reordered instead of recreated, so that components keep their own state and list rendering becomes more efficient.

**If `ink:key` is not provided, a warning is reported. If you clearly know that the list is static, or its order does not matter, you can choose to ignore it.**

## Notes

When the value of `ink:for` is a string, the string is parsed into an array of characters

```html
<view ink:for="array">
  {{item}}
</view>
```
Equivalent to
```html
<view ink:for="{{['a','r','r','a','y']}}">
  {{item}}
</view>
```

*Note: if there are spaces between the curly braces and the quotation marks, the result will be parsed as a string.*

## Loop scope and conditions

Each iteration has its own `item` / `index` scope. Name nested-loop variables explicitly when you need outer values. When `ink:for` and `ink:if` are on the same node, the condition is evaluated in the current item's scope:

```xml
<view ink:for="{{items}}" ink:key="id" ink:if="{{item.visible}}">
  {{index}}: {{item.title}}
</view>
<text>Total: {{items.length}}</text>
```

Bind an array's `.length` to display its count. After list, condition, or bound-attribute updates, query the current rendered tree rather than retaining an Entity removed by a condition.
