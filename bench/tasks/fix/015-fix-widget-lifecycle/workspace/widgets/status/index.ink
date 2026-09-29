<script def>{"widget":{"family":"1x1"}}</script>
<script setup>
export default { data: { status: 'idle' }, onShow() { this.setData({ status: 'active' }); }, onHide() { this.setData({ status: 'idle' }); } };
</script>
<widget><view><text>{{status}}</text></view></widget>
<style>.root { width: 100%; height: 100%; }</style>
