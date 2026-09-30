<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Filter Results", "info": "", "items": [{"id": "g", "name": "Glasses"}, {"id": "p", "name": "Phone"}, {"id": "s", "name": "Speaker"}], "query": "", "filtered": [{"id": "g", "name": "Glasses"}, {"id": "p", "name": "Phone"}, {"id": "s", "name": "Speaker"}], "empty": false},
onInput(e) {}, clear() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><input value="{{query}}" bindinput="onInput"/><view wx:for="{{filtered}}"><text>{{item.name}}</text></view><text wx:if="{{empty}}">No results</text><button bindtap="clear">Clear</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
