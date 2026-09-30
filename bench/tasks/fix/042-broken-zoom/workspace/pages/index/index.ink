<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"zoom": 1}, act() { this.data.zoom = this.data.zoom + 1; } };
</script>
<page><view><text>{{zoom}}</text><button bindtap="act">Zoom</button></view></page>
<style>.root { display: flex; }</style>
