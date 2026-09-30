<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
Page({ data: {"hearts": 0}, act() { this.setData({ hearts: this.data.hearts + 1 }); } });
</script>
<page><view><text>{{hearts}}</text><button bindtap="act">Heart</button></view></page>
<style>.root { display: flex; }</style>
