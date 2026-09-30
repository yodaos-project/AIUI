<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>
import wx from 'wx';
export default { data: {"title": "Storage Recovery", "info": "", "draft": "", "status": "idle"},
edit(e) { this.setData({draft:e.detail.value}); }, save() { wx.setStorageSync("draft",this.data.draft); this.setData({status:"Saved"}); }, restore() { this.setData({draft:wx.getStorageSync("draft") || ""}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><input value="{{draft}}" bindinput="edit"/><text>{{status}}</text><button bindtap="save">Save</button><button bindtap="restore">Restore</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
