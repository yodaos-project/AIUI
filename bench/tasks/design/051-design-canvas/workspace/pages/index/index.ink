<script def>{"navigationBarTitleText":"Design"}</script>
<script setup>
export default { data: {"title": "Home", "count": 0}, advance() { this.setData({ count: this.data.count + 1 }); } };
</script>
<page><view class="canvas"><text class="title">{{title}}</text><text>{{count}}</text><button class="action" bindtap="advance">Advance</button></view></page>
<style>
.canvas { width: 480px; height: 352px; background-color: #ffffff; }
.title, .value, .metadata, .status, .device-title { color: #ff0000; font-size: 24px; font-weight: 700; }
.action { min-height: 60px; background-color: #40ff5e; }
.device-row, .error { background-color: #ff0000; border-width: 4px; border-radius: 12px; }
</style>
