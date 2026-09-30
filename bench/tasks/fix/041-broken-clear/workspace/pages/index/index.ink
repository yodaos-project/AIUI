<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"errors": 2}, act() { this.data.errors = 0; } };
</script>
<page><view><text>{{errors}}</text><button bindtap="act">Clear</button></view></page>
<style>.root { display: flex; }</style>
