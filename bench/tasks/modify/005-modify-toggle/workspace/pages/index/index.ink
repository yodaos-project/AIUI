<script def>{"navigationBarTitleText":"Status"}</script>
<script setup>
export default { data: { title: 'Status', enabled: false }, onLoad() { this.setData({ enabled: false }); } };
</script>
<page><view><text>{{title}}</text><text>{{enabled}}</text></view></page>
<style>.root { display: flex; }</style>
