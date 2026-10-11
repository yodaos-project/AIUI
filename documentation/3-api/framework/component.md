# Component

`Component` 表示 AIUI 自定义组件在运行时暴露出来的实例对象。

当你在组件的 `methods`、`lifetimes` 或事件处理函数里通过 `this` 访问组件实例时，拿到的就是 `Component` 能力表面。

## 定义并使用组件

```javascript
export default {
  data: {
    count: 0
  },
  properties: {
    title: {
      type: String,
      value: 'Untitled'
    }
  },
  methods: {
    increment() {
      const nextCount = this.data.count + 1;

      this.setData({
        count: nextCount
      });

      this.triggerEvent('change', {
        value: nextCount
      });
    }
  }
}
```

## 生命周期中的 `this`

组件生命周期回调同样以当前组件实例作为 `this` 执行。

当前常见生命周期包括：

- `created`
- `attached`
- `ready`
- `moved`
- `detached`

```javascript
export default {
  lifetimes: {
    ready() {
      console.log(this.data);
    }
  }
}
```

## 检查具名插槽

运行时会把宿主提供的具名插槽快照放在 `this.$slots` 中，也可以用 `hasSlot()` 判断某个插槽是否有内容：

```javascript
export default {
  lifetimes: {
    ready() {
      if (this.hasSlot('actions')) {
        console.log(this.$slots.actions);
      }
    },
  },
};
```

## API Reference

### 实例成员

| 成员 | 类型 | 说明 |
| :--- | :--- | :--- |
| `this.data` | `Object` | 当前组件的本地状态对象 |
| `this.properties` | `Object` | 当前组件已解析的输入属性 |
| `this.setData(data, callback?)` | `Function` | 更新组件状态并触发视图刷新 |
| `this.triggerEvent(name, detail?)` | `Function` | 向父级派发自定义事件 |
| `this.$slots` | `Readonly<Record<string, readonly ComponentSlotEntry[]>>` | 宿主提供的具名插槽快照 |
| `this.hasSlot(name)` | `Function` | 判断指定具名插槽是否包含内容 |

写在 `methods` 里的方法会被直接挂到组件实例上，并以当前组件实例作为 `this` 执行。

### 生命周期回调

组件生命周期描述一个组件实例从创建、挂载、首次渲染到移动和卸载的过程。回调定义在 `lifetimes` 中，每个回调都以当前组件实例作为 `this` 执行。

![Component 从创建、挂载和首次渲染进入活动状态，可发生移动，最终卸载](../../image/framework/component-lifecycle-flow.svg)

`created()`、`attached()` 和 `ready()` 构成组件首次进入宿主树的主流程。组件保持挂载时可能多次触发 `moved()`；从宿主树移除时触发 `detached()` 并结束当前实例的生命周期。

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `created` | 监听组件实例创建 | 组件实例与初始状态创建后触发 |
| `attached` | 监听组件挂载 | 组件挂载到宿主树后触发 |
| `ready` | 监听组件首次渲染完成 | 包含组件子树的首帧实际呈现后触发，每个实例一次 |
| `moved` | 监听组件节点移动 | 组件在宿主树中的位置发生变化时触发 |
| `detached` | 监听组件卸载 | 组件从宿主树移除时触发 |

#### `lifetimes.created()`

组件实例和初始 `data`、`properties` 创建后调用。适合初始化不依赖组件已经挂载或渲染的本地状态。此时不要执行依赖宿主树或首次渲染完成的操作。

#### `lifetimes.attached()`

组件挂载到宿主树后调用。适合建立与宿主节点相关的监听或启动组件挂载期间需要运行的任务。

#### `lifetimes.ready()`

包含组件子树的首帧实际呈现后调用。适合执行依赖组件视图已准备完成的初始化逻辑；后续状态更新不会再次触发该回调。

晚于页面首帧挂载的组件也会等待包含自身内容的帧呈现后触发 `ready()`。后续数据更新、移动和重新显示不会重复触发；呈现前移除的实例不会收到迟到回调。

#### `lifetimes.moved()`

组件节点在宿主树中的位置发生变化时调用。仅在需要响应组件重排或父级关系变化时使用。

#### `lifetimes.detached()`

组件从宿主树移除时调用。适合停止计时器、取消未完成任务、注销监听器，以及释放该组件实例持有的资源。

### 节点事件处理函数

组件不会自动接收 Page 或 App 上的宿主级回调。需要响应按键时，应在模板节点上绑定事件，并把处理函数定义在 `methods` 中。

| 处理函数 | 对应绑定 | 说明 |
| :--- | :--- | :--- |
| `onKeyDown(event)` | `bindkeydown="onKeyDown"` | 处理当前组件节点上的按键按下事件 |
| `onKeyUp(event)` | `bindkeyup="onKeyUp"` | 处理当前组件节点上的按键抬起事件 |

#### `methods.onKeyDown(KeyboardEvent event)`

当绑定了 `bindkeydown="onKeyDown"` 的组件节点收到按键按下事件时调用。`event.code` 表示按键编码，回调中的 `this` 指向当前组件实例，因此可以直接调用 `this.setData()` 更新组件状态。

#### `methods.onKeyUp(KeyboardEvent event)`

当绑定了 `bindkeyup="onKeyUp"` 的组件节点收到按键抬起事件时调用。`event.code` 表示按键编码；如果该按键带有默认行为，可以调用 `event.preventDefault()` 阻止默认行为。组件不会因为只定义了同名方法就自动收到事件，模板绑定是必需的。

### `this.data`

`data` 用来保存组件自己的可变状态。

- 如果组件定义里没有显式声明 `data`，运行时会初始化为空对象
- `setData()` 更新后，`this.data` 会同步反映最新状态
- 支持路径式更新，例如 `'profile.name': 'AIUI'`

### `this.properties`

`properties` 保存组件当前的输入属性值。

- 属性声明定义在 `properties` 配置项里
- 运行时会合并默认值和父级传入值
- `this.properties` 反映的是当前生效值

```javascript
export default {
  properties: {
    title: {
      type: String,
      value: 'Untitled'
    }
  },
  lifetimes: {
    created() {
      console.log(this.properties.title);
    }
  }
}
```

### `this.$slots` 与 `this.hasSlot(name)`

`this.$slots[name]` 中的条目包含以下字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tagName` | `string` | 解析后的具体标签名。 |
| `attributes` | `Record<string, string>` | 来源节点的渲染属性。 |
| `textContent` | `string` | 可选的文本内容。 |
| `sourceComponentId` | `string` | 可选的来源自定义组件标识。 |

`this.hasSlot(name)` 返回 `boolean`，用于判断宿主是否向该具名插槽提供了内容。

### `this.setData(Object data, Function? callback)`

`setData()` 用于把逻辑层的数据补丁合并到当前组件状态中。

- `data` 必须是对象
- 顶层 key 会直接写入 `data`
- 点路径 key 会按需创建中间对象
- `callback` 会在更新完成后执行

```javascript
export default {
  data: {
    profile: {
      name: 'AIUI'
    }
  },
  methods: {
    updateProfile() {
      this.setData({
        'profile.name': 'AIUI Agent'
      }, () => {
        console.log('component state updated');
      });
    }
  }
}
```

### `this.triggerEvent(String name, Object? detail)`

`triggerEvent()` 用于从当前组件向父级派发自定义事件。

- `name` 是事件名
- `detail` 是可选的事件负载
- 父页面或父组件可以通过 `bind<event>` 监听

```javascript
export default {
  methods: {
    handleSelect() {
      this.triggerEvent('select', {
        id: this.properties.itemId
      });
    }
  }
}
```
