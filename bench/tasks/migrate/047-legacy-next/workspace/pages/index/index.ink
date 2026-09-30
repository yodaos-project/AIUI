<script def>{"navigationBarTitleText":"Home"}</script>
<script setup>
Page({ data: {"track": 1}, act() { this.setData({ track: this.data.track + 1 }); } });
</script>
<page><view><text>{{track}}</text><button bindtap="act">Next Track</button></view></page>
<style>.root { display: flex; }</style>
