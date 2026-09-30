<script def>{"widget": {"family": "1x1"}}</script>
<script setup>

export default { data: {"title": "Widget Relative Layout", "info": "", "refreshes": 0},
refresh() { this.setData({refreshes:this.data.refreshes+1}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<widget><view class="root"><text>{{title}}</text><text>{{refreshes}}</text><button bindtap="refresh">Refresh</button><text>{{info}}</text><button bindtap="about">About</button></view></widget>
<style>.root { width: 239px; height: 140px; }</style>
