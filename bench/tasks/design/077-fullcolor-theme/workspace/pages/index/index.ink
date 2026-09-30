<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Fullcolor Theme", "info": "", "updates": 0},
update() { this.setData({updates:this.data.updates+1}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text class="accent">Summary</text><text class="error">Error</text><text>{{updates}}</text><button bindtap="update">Update</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { width: 480px; height: 352px; position: sticky; background-color: #ffffff; } .accent { color: #3366ff; } .error { color: #dd3333; }</style>
