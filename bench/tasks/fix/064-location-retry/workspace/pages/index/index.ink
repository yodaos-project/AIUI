<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Location Retry", "info": "", "latitude": null, "longitude": null, "status": "idle"},
locate() { navigator.geolocation.getCurrentPosition(pos => { this.setData({latitude:pos.coords.latitude,longitude:pos.coords.longitude,status:"Ready"}); }); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{latitude}}</text><text>{{longitude}}</text><text>{{status}}</text><button bindtap="locate">Locate</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
