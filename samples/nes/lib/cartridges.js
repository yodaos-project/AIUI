const cartridges = [
  { rom: 'super-mario-bros.nes', title: '超级玛丽', description: '本地卡带 · Z 跳跃，X 加速', image: '/assets/platformer.png', local: true },
  { rom: 'falling-blocks.nes', title: '落块消行', description: '旋转方块，填满一行即可消除', image: '/assets/falling-blocks.png' },
  { rom: 'breakout.nes', title: '打砖块', description: '左右移动挡板，反弹小球击碎砖墙', image: '/assets/breakout.png' },
  { rom: 'pong.nes', title: 'Pong 乒乓', description: '上下移动球拍，与电脑对打', image: '/assets/pong.png' },
  { rom: 'void-lancer.nes', title: 'VOID LANCER', description: '纵版射击 · Z 开火，X 投弹', image: '/assets/void-lancer.png' },
  { rom: 'mines.nes', title: '扫雷', description: '移动光标，Z 翻格，X 插旗', image: '/assets/mines.png' },
  { rom: '2048.nes', title: '2048', description: '用方向键合并相同数字', image: '/assets/2048.png' },
  { rom: 'concentration.nes', title: '翻牌配对', description: '记住图案的位置，翻出相同的一对', image: '/assets/concentration.png' },
  { rom: 'falling.nes', title: 'Falling', description: '在下落途中躲开障碍', image: '/assets/falling.png' },
  { rom: 'nesnake.nes', title: 'NESnake', description: '收集苹果，让蛇身变长', image: '/assets/nesnake.png' },
];

export async function availableCartridges() {
  const games = await Promise.all(cartridges.map(async (game) => {
    if (!game.local) return game;
    const response = await fetch('file:///assets/' + encodeURIComponent(game.rom), { method: 'HEAD' }).catch(() => null);
    return response && response.ok ? game : null;
  }));
  return games.filter(Boolean);
}

export function isCartridgeFilename(name) {
  return typeof name === 'string' && /^[^/\\?#]+\.nes$/i.test(name);
}

export function cartridgeFor(rom) {
  return cartridges.find((game) => game.rom === rom) || {
    rom, title: rom.replace(/\.nes$/i, ''), description: '本地 NES 卡带', image: '',
  };
}
