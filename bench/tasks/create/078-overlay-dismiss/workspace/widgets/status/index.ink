<script def>{"widget": {"family": "1x1"}}</script>
<script setup>

export default { data: {"status": "Ready"},
dismiss() {}
};
</script>
<widget><view class="root"><text>{{status}}</text><button bindtap="dismiss">Dismiss</button></view></widget>
<style>.root { display: flex; flex-direction: column; }</style>
