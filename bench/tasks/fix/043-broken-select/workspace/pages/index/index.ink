<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"selected": false}, act() { this.data.selected = true; } };
</script>
<page><view><text>{{selected}}</text><button bindtap="act">Select</button></view></page>
<style>.root { display: flex; }</style>
