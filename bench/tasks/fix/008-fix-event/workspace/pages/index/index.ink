<script def>{"navigationBarTitleText":"Action"}</script>
<script setup>
export default { data: { message: 'Ready' }, activate() { this.setData({ message: 'Done' }); } };
</script>
<page><view><text>{{message}}</text><button onclick="activate">Go</button></view></page>
<style>.root { display: flex; }</style>
