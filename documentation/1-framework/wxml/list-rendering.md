# 列表渲染

## ink:for

在组件上使用 `ink:for` 控制属性绑定一个数组，即可使用数组中各项的数据重复渲染该组件。

默认数组的当前项的下标变量名默认为 `index`，数组当前项的变量名默认为 `item`

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

使用 `ink:for-item` 可以指定数组当前元素的变量名，

使用 `ink:for-index` 可以指定数组当前下标的变量名：

```html
<view ink:for="{{array}}" ink:for-index="idx" ink:for-item="itemName">
  {{idx}}: {{itemName.message}}
</view>
```

`ink:for` 也可以嵌套，下边是一个九九乘法表

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

类似 `block ink:if`，也可以将 `ink:for` 用在 `<block/>` 标签上，以渲染一个包含多节点的结构块。例如：

```html
<block ink:for="{{[1, 2, 3]}}">
  <view> {{index}}: </view>
  <view> {{item}} </view>
</block>
```

## ink:key

如果列表中项目的位置会动态改变或者有新的项目添加到列表中，并且希望列表中的项目保持自己的特征和状态（如 input 中的输入内容，switch 的选中状态），需要使用 `ink:key` 来指定列表中项目的唯一的标识符。

`ink:key` 的值以两种形式提供

1. 字符串，代表在 for 循环的 array 中 item 的某个 property，该 property 的值需要是列表中唯一的字符串或数字，且不能动态改变。
2. 保留关键字 `*this` 代表在 for 循环中的 item 本身，这种表示需要 item 本身是一个唯一的字符串或者数字。

当数据改变触发渲染层重新渲染的时候，会校正带有 key 的组件，框架会确保他们被重新排序，而不是重新创建，以确保使组件保持自身的状态，并且提高列表渲染时的效率。

**如不提供 `ink:key`，会报一个 warning， 如果明确知道该列表是静态，或者不必关注其顺序，可以选择忽略。**

## 注意事项

当 `ink:for` 的值为字符串时，会将字符串解析成字符串数组

```html
<view ink:for="array">
  {{item}}
</view>
```
等同于
```html
<view ink:for="{{['a','r','r','a','y']}}">
  {{item}}
</view>
```

*注意： 花括号和引号之间如果有空格，将最终被解析成为字符串*

## 循环作用域与条件

每次迭代有自己的 `item` / `index` 作用域；嵌套循环可显式命名变量以访问外层数据。同一节点同时使用 `ink:for` 和 `ink:if` 时，条件在当前项的作用域中求值：

```xml
<view ink:for="{{items}}" ink:key="id" ink:if="{{item.visible}}">
  {{index}}: {{item.title}}
</view>
<text>共 {{items.length}} 项</text>
```

可使用数组的 `.length` 绑定数量。更新列表、条件或绑定属性后，节点查询应使用当前渲染树，不应缓存已经被条件移除的 Entity。
