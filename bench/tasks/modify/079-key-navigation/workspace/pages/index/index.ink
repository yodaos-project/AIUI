<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Key Navigation", "info": "", "items": [{"id": "g", "name": "Glasses"}, {"id": "p", "name": "Phone"}, {"id": "s", "name": "Speaker"}], "selectedIndex": 0, "confirmed": ""},
onKeyUp(event) {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><view wx:for="{{items}}"><text>{{item.name}}</text></view><text>{{selectedIndex}}</text><text>{{confirmed}}</text><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
