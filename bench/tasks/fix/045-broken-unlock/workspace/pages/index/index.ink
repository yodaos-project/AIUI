<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"locked": true}, act() { this.data.locked = false; } };
</script>
<page><view><text>{{locked}}</text><button bindtap="act">Unlock</button></view></page>
<style>.root { display: flex; }</style>
