<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
Page({ data: {"finished": false}, act() { this.setData({ finished: true }); } });
</script>
<page><view><text>{{finished}}</text><button bindtap="act">Finish</button></view></page>
<style>.root { display: flex; }</style>
