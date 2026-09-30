<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Dataset Selection", "info": "", "items": [{"id": "g", "name": "Glasses"}, {"id": "p", "name": "Phone"}, {"id": "s", "name": "Speaker"}], "selected": ""},
select(e) { this.setData({selected:this.data.items[0].id}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><view wx:for="{{items}}" data-id="{{item.id}}" bindtap="select"><text>{{item.name}}</text></view><text>{{selected}}</text><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
