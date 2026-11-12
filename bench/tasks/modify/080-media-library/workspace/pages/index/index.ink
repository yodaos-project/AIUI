<script def>{"navigationBarTitleText":"Photos"}</script>
<script setup>
export default {
  data: { title: 'Photos', filename: '', status: 'idle' },
  load() {},
};
</script>
<page><view><text>{{title}}</text><text>{{filename}}</text><text>{{status}}</text><button bindtap="load">Load Photos</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
