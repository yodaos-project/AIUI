<script def>{"navigationBarTitleText": "Benchmark"}</script>
<script setup>

export default { data: {"title": "Swiper Controls", "info": "", "page": 1},
previous() { this.setData({page:this.data.page-1}); }, next() { this.setData({page:this.data.page+1}); },
about() { this.setData({ info: "AIUI" }); }
};
</script>
<page><view class="root"><text>{{title}}</text><swiper><swiper-item wx:if="{{page === 1}}"><text>Welcome</text></swiper-item><swiper-item wx:if="{{page === 2}}"><text>Connect</text></swiper-item><swiper-item wx:if="{{page === 3}}"><text>Finish</text></swiper-item></swiper><text>{{page}}</text><button bindtap="previous">Previous</button><button bindtap="next">Next</button><text>{{info}}</text><button bindtap="about">About</button></view></page>
<style>.root { display: flex; flex-direction: column; }</style>
