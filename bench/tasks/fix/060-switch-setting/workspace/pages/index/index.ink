<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Switch Setting", "info": "", "enabled": false},
change(e) { this.setData({enabled:!this.data.enabled}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><switch checked="{{enabled}}" bindchange="change"/><text>{{enabled}}</text><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
