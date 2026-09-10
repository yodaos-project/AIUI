# Create Your First AIUI Agent

This tutorial creates a minimal AIUI project and displays a welcome message from a single-file `.ink` page.

## Create the Project

<!-- aiui-tutorial-step -->

Run the scaffold and enter the project directory. The scaffold creates `app.json`, `app.js`, `AGENTS.md`, and the page directory.

```bash
npm create @yodaos-pkg/aiui-agent@latest hello-aiui
cd hello-aiui
```

<!-- /aiui-tutorial-step -->

## Register the Home Page

<!-- aiui-tutorial-step -->

`app.json` declares the Pages provided by the agent. This example registers one home page and omits the file extension from its path.

```json
{
  "pages": [
    "pages/index/index"
  ]
}
```

<!-- /aiui-tutorial-step -->

## Write the Page

<!-- aiui-tutorial-step -->

Create `pages/index/index.ink`. A single `.ink` file can contain page logic, structure, and styles, which makes it convenient for a first runnable interface.

```html
<script setup>
export default {
  data: {
    message: 'Hello, AIUI!'
  }
};
</script>

<page>
  <view class="page">
    <text class="title">{{ message }}</text>
  </view>
</page>

<style>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.title {
  font-size: 28px;
  font-weight: 600;
}
</style>
```

<!-- /aiui-tutorial-step -->

You can now import the project into AIUI Studio and inspect it with the preview. Continue with [Project Structure](/AIUI/guide/structure) to learn how Pages, Widgets, and Agent Workers are organized.
