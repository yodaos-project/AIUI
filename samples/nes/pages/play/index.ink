<script type="application/json" def>
{
  "navigationBarTitleText": "NES 模拟器"
}
</script>

<script setup>
import wx from 'wx';
import { cartridgeFor } from '../../lib/cartridges.js';
import { openCartridge, WIDTH, HEIGHT } from '../../lib/emulator.js';
import { Speaker, hasNativeAudio } from '../../lib/speaker.js';

const MAX_FRAMES_PER_TICK = 6;
const KEYS = {
  z: 1, x: 2, shift: 4, shiftleft: 4, shiftright: 4, enter: 8,
  arrowup: 16, arrowdown: 32, arrowleft: 64, arrowright: 128,
};

export default {
  data: {
    title: '', status: '正在读取卡带…', paused: false, ready: false, muted: !hasNativeAudio,
  },

  async onLoad(query) {
    this.held = new Map();
    this.pending = 0;
    this.raf = null;
    const filename = (query && query.rom) || 'falling.nes';
    this.setData({ title: cartridgeFor(filename).title });

    try {
      const emulator = await openCartridge(filename);
      if (this.unloaded) return;
      this.emulator = emulator;
      this.startIfReady();
    } catch (error) {
      if (!this.unloaded) this.setData({ status: error.message || String(error) });
    }
  },

  onShow() {
    this.visible = true;
    this.schedule();
  },

  onReady() {
    this.ctx = wx.createCanvasContext('screen');
    if (!this.ctx) {
      this.setData({ status: '无法创建游戏画布' });
      return;
    }
    this.image = this.ctx.createImageData(WIDTH, HEIGHT);
    this.startIfReady();
  },

  startIfReady() {
    if (!this.emulator || !this.image) return;
    this.setData({ ready: true, status: '' });
    this.schedule();
  },

  onHide() {
    this.visible = false;
    this.stop();
  },

  onUnload() {
    this.unloaded = true;
    this.visible = false;
    this.stop();
    this.emulator = null;
    this.image = null;
    this.ctx = null;
  },

  onKeyDown(event) {
    const key = event.code.toLowerCase().replace(/^key/, '');
    const bit = KEYS[key];
    if (bit && this.data.ready && !this.data.paused && !this.held.has(key)) {
      this.held.set(key, bit);
      this.pending |= bit; // A quick tap can finish between emulated frames.
    }
  },

  onKeyUp(event) {
    const key = event.code.toLowerCase().replace(/^key/, '');
    if (KEYS[key]) {
      event.preventDefault();
      this.held.delete(key);
      return;
    }
    switch (key) {
      case 'escape':
      case 'backspace':
        event.preventDefault();
        wx.navigateBack({ fail: () => wx.redirectTo({ url: '/pages/index/index' }) });
        break;
      case 'p': this.togglePause(); break;
      case 'r': this.reset(); break;
      case 'm': if (this.data.ready) this.toggleAudio(); break;
    }
  },

  stopAudio() {
    const speaker = this.speaker;
    this.speaker = null;
    if (speaker) speaker.close();
  },

  stop() {
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.nextFrame = null;
    this.pending = 0;
    this.held.clear();
    this.stopAudio();
  },

  togglePause() {
    if (!this.emulator) return;
    this.stop();
    this.setData({ paused: !this.data.paused });
    this.schedule();
  },

  reset() {
    if (!this.emulator) return;
    this.stop();
    this.emulator.reset();
    this.setData({ paused: false });
    this.schedule();
  },

  toggleAudio() {
    this.stopAudio();
    this.setData({ muted: !this.data.muted, status: '' });
    if (!this.data.muted && !this.data.paused) this.startAudio();
  },

  startAudio() {
    try {
      const speaker = new Speaker();
      this.speaker = speaker;
      speaker.start((error) => {
        if (this.speaker === speaker) this.audioFailed(error);
      });
    } catch (error) {
      this.audioFailed(error);
    }
  },

  audioFailed(error) {
    this.stopAudio();
    const status = String(error).includes('_current') ? '进入全屏后可开声' : '音频输出不可用';
    this.setData({ muted: true, status });
  },

  schedule() {
    if (!this.visible || !this.emulator || !this.image || this.data.paused || this.raf != null) return;
    this.raf = requestAnimationFrame((now) => {
      this.raf = null;
      try {
        this.draw(now);
        this.schedule();
      } catch (error) {
        this.stop();
        this.emulator = null;
        this.setData({ ready: false, status: error.message || String(error) });
      }
    });
  },

  draw(now) {
    const interval = this.emulator.frameMs;
    this.nextFrame ??= now;
    if (now < this.nextFrame) return;
    const due = 1 + Math.floor((now - this.nextFrame) / interval);
    const frames = Math.min(due, MAX_FRAMES_PER_TICK);
    this.nextFrame += (due - frames) * interval;
    if (!this.data.muted && !this.speaker) this.startAudio();
    let buttons = 0;
    for (const bit of this.held.values()) buttons |= bit;
    for (let i = 0; i < frames; i++) {
      // Catch up on input and sound; only the last frame reaches the display.
      const image = i === frames - 1 ? this.image : null;
      const pcm = this.emulator.step(buttons | this.pending, image, !!this.speaker);
      if (pcm) {
        try {
          this.speaker.append(pcm);
        } catch (error) {
          this.audioFailed(error);
        }
      }
      this.pending = 0;
      this.nextFrame += this.emulator.frameMs;
    }
    this.ctx.putImageData(this.image, 0, 0);
    this.ctx.flush();
  },
};
</script>

<page>
  <view class="page session">
    <view class="bar">
      <view class="identity">
        <text class="heading">{{title}}</text>
        <text ink:if="{{paused}}" class="paused">已暂停</text>
      </view>
      <text class="caption">Esc 返回选游戏</text>
    </view>
    <view class="stage">
      <canvas id="screen" width="256" height="240" class="screen"></canvas>
      <text ink:if="{{status}}" class="feedback">{{status}}</text>
    </view>
    <view ink:if="{{ready}}" class="legend">
      <text class="caption">方向键移动　Z / X 对应 A / B　Enter 开始　Shift 选择</text>
      <text class="caption">P {{paused ? '继续' : '暂停'}}　R 复位　M {{muted ? '开声' : '静音'}}</text>
    </view>
  </view>
</page>

<style>
.session { gap: 4px; }
.bar { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 8px; }
.identity { display: flex; flex-direction: row; align-items: center; gap: 8px; }
.paused { color: #ffd966; font-size: 14px; }
.stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.screen { width: 256px; height: 240px; flex-shrink: 0; }
.feedback {
  position: absolute;
  font-size: 16px;
  font-weight: 600;
  color: #ffd966;
  text-shadow: 0 1px 2px #000000;
}
.legend { display: flex; flex-direction: column; align-items: center; gap: 2px; }
@media (max-height: 320px) {
  .screen { width: 192px; height: 180px; }
}
@media (max-height: 240px) {
  .screen { width: 128px; height: 120px; }
}
</style>
