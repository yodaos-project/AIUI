<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"title": "Home", "progress": 50} };
</script>
<page><view><text>{{progress}}</text><text>{{title}}</text></view></page>
<style>.root { display: flex; }</style>
