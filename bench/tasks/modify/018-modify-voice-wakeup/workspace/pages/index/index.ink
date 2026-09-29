<script def>{}</script>
<script setup>
export default { data: { wakeups: 0 }, onVoiceWakeup(event) { if (event.keyword !== 'Hi Rokid') return; this.setData({ wakeups: this.data.wakeups + 1 }); } };
</script>
<page><view><text>{{wakeups}}</text></view></page>
<style>.root { display: flex; }</style>
