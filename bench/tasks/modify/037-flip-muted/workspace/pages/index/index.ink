<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"title": "Home", "muted": false} };
</script>
<page><view><text>{{muted}}</text><text>{{title}}</text></view></page>
<style>.root { display: flex; }</style>
