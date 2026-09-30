<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>
import { formatDistance } from '../../lib/format.js';
export default { data: {"title": "Shared Formatting", "info": "", "reading": 1.25, "formatted": ""},
refresh() { this.setData({formatted:formatDistance(this.data.reading)}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><text>{{formatted}}</text><button bindtap="refresh">Refresh</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
