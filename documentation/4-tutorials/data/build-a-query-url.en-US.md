# Add Query Parameters to a URL

Build a search URL that keeps spaces and `&` inside a single parameter value. The page displays the resulting URL.

## Set a Search Term with searchParams

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Pass the original search term to `searchParams.set()`, then read the encoded address from `href`. The existing `page` parameter stays in place.

```html
<script setup>
const term = 'tea & coffee';
const url = new URL('https://example.com/search?page=1');
url.searchParams.set('q', term);

export default {
  data: { address: url.href }
};
</script>

<page>
  <text>{{ address }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the preview and check that the URL still contains `page=1` and that the `&` inside the term appears as `%26`. Change the term to `C++` and reload. Both plus signs should appear as `%2B`.

See [URL](/AIUI/api/network-url) for the full API.
