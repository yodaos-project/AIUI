<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Network Retry", "info": "", "endpoint": "https://api.example.test/items", "items": [], "loading": false, "status": "idle"},
async load() { this.setData({loading:true}); const response=await fetch(this.data.endpoint); const body=await response.json(); this.setData({items:body.items,status:"Ready",loading:false}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><view wx:for="{{items}}"><text>{{item}}</text></view><text>{{loading}}</text><text>{{status}}</text><button bindtap="load">Load</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
