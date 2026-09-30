<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Watch Resume", "info": "", "latitude": null, "status": "idle"},
onShow() { this.watchId=navigator.geolocation.watchPosition(pos=>this.setData({latitude:pos.coords.latitude})); }, onHide() {}, onUnload() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{latitude}}</text><text>{{status}}</text><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
