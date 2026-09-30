<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"id": "", "name": "", "info": ""},
onLoad(query) {}, back() {}
};
</script>
<page><view class="root"><text>{{id}}</text><text>{{name}}</text><text>{{info}}</text><button bindtap="back">Back</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
