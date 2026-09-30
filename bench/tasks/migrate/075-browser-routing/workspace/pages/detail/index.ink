<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"id": ""},
onLoad(query) { this.setData({id:query.id}); }
};
</script>
<page><view class="root"><text>{{id}}</text></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
