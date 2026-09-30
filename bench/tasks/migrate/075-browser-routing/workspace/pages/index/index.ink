<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>
import wx from 'wx';
export default { data: {"title": "Browser Routing", "info": "", "selected": "g"},
open() { window.location.href="/pages/detail/index?id="+this.data.selected; },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{selected}}</text><button bindtap="open">Open</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
