<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
export default { data: {"position": 1}, act() { this.data.position = this.data.position + 2; } };
</script>
<page><view><text>{{position}}</text><button bindtap="act">Skip</button></view></page>
<style>.root { display: flex; }</style>
