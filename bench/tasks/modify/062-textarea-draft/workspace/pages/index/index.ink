<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Textarea Draft", "info": "", "draft": "", "saved": ""},
edit(e) {}, save() {}, clear() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><textarea value="{{draft}}" bindinput="edit"/><text>{{saved}}</text><button bindtap="save">Save</button><button bindtap="clear">Clear</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
