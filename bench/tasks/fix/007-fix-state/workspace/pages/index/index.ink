<script def>{"navigationBarTitleText":"Counter"}</script>
<script setup>
export default {
 data: { count: 0 },
 increment() { this.data.count += 1; },
 decrement() { this.setData({ count: this.data.count - 1 }); }
};
</script>
<page><view><text>{{count}}</text><button bindtap="increment">+</button><button bindtap="decrement">-</button></view></page>
<style>.root { display: flex; }</style>
