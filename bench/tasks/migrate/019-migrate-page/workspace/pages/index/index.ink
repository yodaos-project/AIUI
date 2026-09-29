<script def>{}</script>
<script setup>
Page({ data: { count: 0 }, increment() { this.setData({ count: this.data.count + 1 }); } });
</script>
<page><view><text>{{count}}</text><button bindtap="increment">Increment</button></view></page>
<style>.root { display: flex; }</style>
