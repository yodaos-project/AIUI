<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"title": "Home", "unread": 3} };
</script>
<page><view><text>{{unread}}</text><text>{{title}}</text></view></page>
<style>.root { display: flex; }</style>
