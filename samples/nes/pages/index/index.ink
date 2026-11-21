<script type="application/json" def>
{ "navigationBarTitleText": "NES 游戏库" }
</script>

<script setup>
import wx from 'wx';
import { availableCartridges, cartridgeFor, isCartridgeFilename } from '../../lib/cartridges.js';

export default {
  data: { games: [], selected: 0, error: '' },

  async onLoad(query) {
    const games = await availableCartridges();
    if (this.unloaded) return;
    const rom = query && query.rom;
    if (!rom) {
      this.setData({ games });
      return;
    }
    if (!isCartridgeFilename(rom)) {
      this.setData({ games, error: '请指定 assets 目录中的 .nes 卡带' });
      return;
    }
    let selected = games.findIndex((game) => game.rom === rom);
    if (selected < 0) selected = games.push(cartridgeFor(rom)) - 1;
    this.setData({ games, selected });
  },

  onShow() {
    this.opening = false;
  },

  onUnload() {
    this.unloaded = true;
  },

  onKeyUp(event) {
    const { games, selected } = this.data;
    if (!games.length) return;
    switch (event.code) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        const step = event.code === 'ArrowUp' ? -1 : 1;
        this.setData({ selected: (selected + step + games.length) % games.length, error: '' });
        break;
      }
      case 'Enter':
        event.preventDefault();
        this.openGame(selected);
        break;
    }
  },

  openCard(event) {
    this.openGame(Number(event.currentTarget.attributes['data-index']));
  },

  openGame(index) {
    const game = this.data.games[index];
    if (!game || this.opening) return;
    this.opening = true;
    this.setData({ selected: index, error: '' });
    wx.navigateTo({
      url: '/pages/play/index?rom=' + encodeURIComponent(game.rom),
      fail: () => {
        this.opening = false;
        this.setData({ error: '无法进入游戏，请重新选择' });
      },
    });
  },
};
</script>

<page>
  <view class="page library">
    <view class="library-heading">
      <text class="heading">选择游戏</text>
      <text ink:if="{{games.length}}" class="caption">{{selected + 1}} / {{games.length}}</text>
    </view>
    <scroll-view class="list" scroll-y="{{true}}" scroll-into-view="game-{{selected}}">
      <view ink:for="{{games}}" ink:key="rom" id="game-{{index}}"
            class="cartridge {{selected === index ? 'selected' : ''}}"
            data-index="{{index}}" bindtap="openCard">
        <image ink:if="{{item.image}}" class="art" src="{{item.image}}" mode="aspectFit" />
        <view class="details">
          <text class="title">{{item.title}}</text>
          <text class="caption">{{item.description}}</text>
        </view>
        <text ink:if="{{selected === index}}" class="arrow">›</text>
      </view>
    </scroll-view>
    <text ink:if="{{error}}" class="error">{{error}}</text>
    <text class="caption">↑ ↓ 选择游戏　·　Enter 开始</text>
  </view>
</page>

<style>
.library { padding: 24px 10px; gap: 10px; }
.library-heading { display: flex; flex-direction: row; align-items: center; justify-content: space-between; }
.list { flex: 1; min-height: 0; }
.cartridge {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 24px 10px;
  border: 1px solid #ffffff;
  border-color: rgba(255,255,255,0.3);
  border-radius: 12px;
  background-color: transparent;
}
.selected, .cartridge:focus { border-color: #ffffff; }
.art { width: 44px; height: 44px; flex-shrink: 0; }
.details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.title { font-size: 20px; font-weight: 600; color: #ffffff; }
.arrow { font-size: 24px; color: #66b3ff; margin-right: 6px; }
</style>
