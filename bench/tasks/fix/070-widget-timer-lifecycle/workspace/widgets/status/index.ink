<script def>{"widget": {"family": "1x1"}}</script>
<script setup>

export default { data: {"title": "Widget Timer Lifecycle", "info": "", "ticks": 0},
onAttach() { this.timer=setInterval(()=>this.setData({ticks:this.data.ticks+1}),1000); }, onDetach() {}, onDestroy() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<widget><view class="root"><text>{{title}}</text><text>{{ticks}}</text><text>{{info}}</text><button bindtap="about">About</button></view></widget>
<style>.root { display: flex; flex-direction: column; }</style>
