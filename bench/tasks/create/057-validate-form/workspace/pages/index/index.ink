<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Validate Form", "info": "", "email": "", "error": "", "status": "idle"},
onInput(e) {}, submit() {}, reset() {},
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><input value="{{email}}" bindinput="onInput"/><text>{{error}}</text><text>{{status}}</text><button bindtap="submit">Submit</button><button bindtap="reset">Reset</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
