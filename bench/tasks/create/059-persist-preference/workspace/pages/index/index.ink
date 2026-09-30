<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>
import wx from 'wx';
export default { data: {"title": "Persist Preference", "info": "", "enabled": false},
onLoad() {}, toggle() { this.setData({enabled:!this.data.enabled}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{enabled}}</text><button bindtap="toggle">Toggle</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
