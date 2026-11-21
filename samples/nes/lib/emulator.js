import wasm from '../assets/nes.wasm';
import { isCartridgeFilename } from './cartridges.js';

export const WIDTH = 256;
export const HEIGHT = 240;

export async function openCartridge(filename) {
  if (!isCartridgeFilename(filename)) {
    throw new Error('请选择 assets 目录中的 .nes 卡带');
  }
  const response = await fetch('file:///assets/' + encodeURIComponent(filename)).catch(() => null);
  if (!response || !response.ok) throw new Error('找不到卡带 ' + filename);
  const rom = new Uint8Array(await response.arrayBuffer());
  if (rom.length < 16 || rom[0] !== 0x4e || rom[1] !== 0x45 ||
      rom[2] !== 0x53 || rom[3] !== 0x1a || !rom[4] || (rom[7] & 12) === 8) {
    throw new Error('需要 iNES 1.0 格式的 NES 卡带');
  }
  const size = 16 + (rom[6] & 4 ? 512 : 0) + rom[4] * 16384 + rom[5] * 8192;
  if (rom.length < size) throw new Error('卡带的 PRG 或 CHR 数据不完整');
  const { instance } = await WebAssembly.instantiate(wasm);
  const core = instance.exports;
  core._initialize();
  const romPointer = core.malloc(size);
  if (!romPointer) throw new Error('卡带所需内存不足');
  new Uint8Array(core.memory.buffer, romPointer, size).set(rom.subarray(0, size));
  const error = core.load_rom(romPointer, size);
  if (error) {
    const bytes = new Uint8Array(core.memory.buffer);
    const message = bytes.subarray(error, bytes.indexOf(0, error));
    throw new Error(new TextDecoder().decode(message));
  }

  const videoPointer = core.video_buffer();
  const audioPointer = core.audio_buffer();
  return {
    frameMs: 1000 / 60,
    reset: core.reset,
    step(buttons, image, withAudio) {
      const samples = core.run_frame(buttons);
      if (samples < 0) throw new Error('模拟器无法继续执行此卡带');
      const memory = core.memory.buffer;
      image.data.set(new Uint8ClampedArray(memory, videoPointer, WIDTH * HEIGHT * 4));
      return withAudio && samples ? new Int16Array(memory, audioPointer, samples) : null;
    },
  };
}
