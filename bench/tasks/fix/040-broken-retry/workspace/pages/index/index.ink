<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"attempts": 0}, act() { this.data.attempts = this.data.attempts + 1; } };
</script>
<page><view><text>{{attempts}}</text><button bindtap="act">Retry</button></view></page>
<style>.root { display: flex; }</style>
