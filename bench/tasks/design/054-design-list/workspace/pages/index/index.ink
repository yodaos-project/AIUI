<script def>{"navigationBarTitleText":"Design"}</script>
<script setup>
export default { data: {"first": "Glasses", "second": "Phone", "scans": 0}, scan() { this.setData({ scans: this.data.scans + 1 }); } };
</script>
<page><view class="canvas"><view class="device-row"><text class="device-title first-title">{{first}}</text></view><view class="device-row"><text class="device-title second-title">{{second}}</text></view><text>{{scans}}</text><button class="action" bindtap="scan">Scan</button></view></page>
<style>
.canvas { width: 480px; height: 352px; background-color: #ffffff; }
.title, .value, .metadata, .status, .device-title { color: #ff0000; font-size: 24px; font-weight: 700; }
.action { min-height: 60px; background-color: #40ff5e; }
.device-row, .error { background-color: #ff0000; border-width: 4px; border-radius: 12px; }
</style>
