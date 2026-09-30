<script def>{"navigationBarTitleText":"Design"}</script>
<script setup>
export default { data: {"message": "Connection lost", "attempts": 0}, retry() { this.setData({ attempts: this.data.attempts + 1 }); } };
</script>
<page><view class="canvas"><view class="error"><text class="error-label">ERROR</text><text class="error-message">{{message}}</text></view><text>{{attempts}}</text><button class="action" bindtap="retry">Retry</button></view></page>
<style>
.canvas { width: 480px; height: 352px; background-color: #ffffff; }
.title, .value, .metadata, .status, .device-title { color: #ff0000; font-size: 24px; font-weight: 700; }
.action { min-height: 60px; background-color: #40ff5e; }
.device-row, .error { background-color: #ff0000; border-width: 4px; border-radius: 12px; }
</style>
