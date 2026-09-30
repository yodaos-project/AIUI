<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"likes": 0}, act() { this.data.likes = this.data.likes + 1; } };
</script>
<page><view><text>{{likes}}</text><button bindtap="act">Like</button></view></page>
<style>.root { display: flex; }</style>
