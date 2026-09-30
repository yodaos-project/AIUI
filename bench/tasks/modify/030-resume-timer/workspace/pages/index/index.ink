<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"title": "Home", "running": false} };
</script>
<page><view><text>{{running}}</text><text>{{title}}</text></view></page>
<style>.root { display: flex; }</style>
