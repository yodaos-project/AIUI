# Custom Fonts

Bundle a font with your application to style card titles, numbers, or body text. This guide uses a `.woff2` file to change the font on one line of text and preview the result.

## Step 1. Add the Font File to the Project

Create `assets/fonts/` in the project root and put the font file there. This guide uses `DemoFont-Regular.woff2` as the example filename. If you use your own font, enter its actual filename in the next step.

WOFF2 support starts with AIUI 0.21. With AIUI 0.20, use a `.ttf` file and enter its path in the next step.

```text
agent-app/
├── app.json
├── assets/
│   └── fonts/
│       └── DemoFont-Regular.woff2
└── pages/
    └── index/
        └── index.ink
```

## Step 2. Register the Font in `app.json`

Add `fonts` to `app.json` at the project root. In an existing project, keep your `pages` and other settings and add this font entry to the `fonts` array.

```json
{
  "pages": ["pages/index/index"],
  "fonts": [
    {
      "family": "Demo Font",
      "src": "assets/fonts/DemoFont-Regular.woff2"
    }
  ]
}
```

- `family` is the name you give the font. Use the same name in `font-family` in the next step.
- `src` is the file path from the project root. Match the filename and its capitalization.

## Step 3. Use the Font on a Page

Put the following in `pages/index/index.ink`, or add the text and styles to an existing page.

```html
<script setup>
export default {};
</script>

<page>
  <text class="custom-font">Hello AIUI 123</text>
</page>

<style>
.custom-font {
  display: block;
  padding: 12px;
  font-family: 'Demo Font', sans-serif;
  font-size: 24px;
}
</style>
```

`sans-serif` is the fallback in `font-family`. If the custom font cannot load or is missing a character, the text can still display in another font.

## Step 4. Preview the Page and Check the Result

Save the files, open the full project in AIUI Studio, and preview `Hello AIUI 123`. If the project was already open, reopen it first. To compare the default font, temporarily remove the new `fonts` entry, reopen the project, then restore the entry. Before publishing, check the actual text, including digits and any non-Latin characters, on the target device.

If the text still uses the default font, check that `family` in `app.json` matches `font-family`, that `src` is correct, and that the font file is included in the package. If only some characters use the fallback, check whether the font contains those characters.
