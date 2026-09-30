<script def>{"widget": {"family": "1x1"}}</script>
<script setup>
import { formatDistance } from '../../lib/format.js';
export default { data: {"reading": 3.2, "formatted": ""},
onAttach() { this.setData({formatted:formatDistance(this.data.reading)}); }
};
</script>
<widget><view class="root"><text>{{formatted}}</text></view></widget>
<style>.root { display: flex; flex-direction: column; }</style>
