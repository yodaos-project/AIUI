<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"title": "Home", "alert": true} };
</script>
<page><view><text>{{alert}}</text><text>{{title}}</text></view></page>
<style>.root { display: flex; }</style>
