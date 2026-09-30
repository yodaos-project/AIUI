<script def>{"navigationBarTitleText":"Design"}</script>
<script setup>
export default { data: {"enabled": false}, toggle() { this.setData({ enabled: !this.data.enabled }); } };
</script>
<page><view class="canvas"><text class="status">{{enabled}}</text><button class="action" bindtap="toggle">Toggle</button></view></page>
<style>
.canvas { width: 480px; height: 352px; background-color: #ffffff; }
.title, .value, .metadata, .status, .device-title { color: #ff0000; font-size: 24px; font-weight: 700; }
.action { min-height: 60px; background-color: #40ff5e; }
.device-row, .error { background-color: #ff0000; border-width: 4px; border-radius: 12px; }
</style>
