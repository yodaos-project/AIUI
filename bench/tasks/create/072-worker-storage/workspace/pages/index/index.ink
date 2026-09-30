<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>
import wx from 'wx';
export default { data: {"title": "Worker Storage", "info": "", "launches": 0},
refresh() { this.setData({launches:wx.getStorageSync("launches") || 0}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{launches}}</text><button bindtap="refresh">Refresh</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
