<script def>{"navigationBarTitleText":"Design"}</script>
<script setup>
export default { data: {"title": "Telemetry", "value": 42, "metadata": "Sensor A"}, refresh() { this.setData({ value: this.data.value + 1 }); } };
</script>
<page><view class="canvas"><text class="title">{{title}}</text><text class="value">{{value}}</text><text class="metadata">{{metadata}}</text><button class="action" bindtap="refresh">Refresh</button></view></page>
<style>
.canvas { width: 480px; height: 352px; background-color: #ffffff; }
.title, .value, .metadata, .status, .device-title { color: #ff0000; font-size: 24px; font-weight: 700; }
.action { min-height: 60px; background-color: #40ff5e; }
.device-row, .error { background-color: #ff0000; border-width: 4px; border-radius: 12px; }
</style>
