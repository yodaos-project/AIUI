<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"paused": false}, act() { this.data.paused = true; } };
</script>
<page><view><text>{{paused}}</text><button bindtap="act">Pause</button></view></page>
<style>.root { display: flex; }</style>
