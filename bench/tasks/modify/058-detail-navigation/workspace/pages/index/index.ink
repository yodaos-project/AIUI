<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>
import wx from 'wx';
export default { data: {"title": "Detail Navigation", "info": "", "query": "", "items": [{"id": "g", "name": "Glasses"}, {"id": "p", "name": "Phone"}, {"id": "s", "name": "Speaker"}]},
onInput(e) { this.setData({query:e.detail.value}); }, open(e) {}, onShow() { this.setData({query:""}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><input value="{{query}}" bindinput="onInput"/><view wx:for="{{items}}" data-id="{{item.id}}" bindtap="open"><text>{{item.name}}</text></view><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
