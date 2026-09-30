<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Debounce Search", "info": "", "endpoint": "https://api.example.test/search", "query": "", "results": [], "loading": false},
edit(e) { this.setData({query:e.detail.value}); }, async search() { const token=this.token=(this.token||0)+1; this.setData({loading:true}); const response=await fetch(this.data.endpoint+"?q="+encodeURIComponent(this.data.query)); const body=await response.json(); if (token===this.token) this.setData({results:body.items,loading:false}); }, onUnload() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><input value="{{query}}" bindinput="edit"/><view wx:for="{{results}}"><text>{{item}}</text></view><text>{{loading}}</text><button bindtap="search">Search</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
