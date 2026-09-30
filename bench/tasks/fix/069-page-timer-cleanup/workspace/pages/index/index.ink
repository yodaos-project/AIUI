<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Page Timer Cleanup", "info": "", "ticks": 0},
onShow() { this.timer=setInterval(()=>this.setData({ticks:this.data.ticks+1}),1000); }, onHide() {}, onUnload() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{ticks}}</text><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
