# NES 模拟器

此 AIUI 示例从游戏库进入独立的模拟器页面。QuickNES 在 WebAssembly 中运行 NES 卡带。画面刷新延迟时，模拟器最多补算六帧，逐帧生成音频，只把最新的 256 × 240 画面写入 Canvas。眼镜和桌面 Ink 通过 AudioPlayer 流式播放 48 kHz 单声道 PCM，Web 预览使用 Web Audio。内置九款游戏，卡带和模拟核心均从应用包读取，离线即可游玩。

## 运行

在仓库根目录执行：

```sh
aix preview samples/nes --launch
```

Web 预览需要 Ink 0.20.1 或更新版本。如果 AIX 当前选择的版本较早，先运行 `aix runtime select` 切换。使用桌面 Ink 也可以直接运行 `ink-open samples/nes`。

启动后先在游戏库用 ↑ / ↓ 选游戏，按 Enter 载入卡带。也可以点击游戏条目。桌面 `ink-open` 默认关闭键盘转发，先点亮窗口右上角的键盘图标。卡带有自己的标题画面，通常再按一次 Enter 进入游戏。

| 操作 | 键盘 |
| --- | --- |
| 十字键 | 方向键 |
| A / B | Z / X |
| Start / Select | Enter / Shift |
| 暂停 / 继续 | P |
| 卡带复位 | R |
| 静音 / 开声 | M |
| 返回游戏库 | Esc 或 Backspace |

`ink-open` 进入游戏后默认开声，Web 预览可在全屏宿主（`_blank`）按 M 开声。离开游戏页时会停止模拟并释放播放器，返回游戏库后保留上次选择。

## 内置游戏

| 游戏 | 玩法与操作 | 卡带来源 |
| --- | --- | --- |
| 落块消行 | 选择单人模式，左右移动方块，旋转拼成完整的一行 | [Legally Distinct Falling Block Game](https://github.com/zorchenhimer/nes-tetris/tree/e64ef29e4b68decd3f2c36a8f9f3cd7d679a4b7c) |
| 打砖块 | 按 Enter 开局，左右移动挡板，让球反弹击碎砖块 | [openNES Breakout v1.0.1](https://github.com/sebastiandine/openNES-Breakout/releases/tag/v1.0.1) |
| Pong 乒乓 | 默认单人对电脑，按 Enter 开球，上下移动球拍 | [openNES Pong v1.0.1](https://github.com/sebastiandine/openNES-Pong/releases/tag/v1.0.1) |
| VOID LANCER | 方向键驾驶战机，Z 开火，X 投弹 | [VOID LANCER v1.0.0](https://github.com/Riyoway/void-lancer-nes/releases/tag/v1.0.0) |
| 扫雷 | 方向键移动光标，Z 翻开格子，X 插旗 | [NES-Minesweeper](https://github.com/ProgrEmily/NES-Minesweeper/tree/1c376724227f4707147af8c7f496898d22fcc2c4) |
| 2048 | 用方向键滑动棋盘，合并相同数字 | [NES 2048 v0.1](https://github.com/G42makes/nes_2048/releases/tag/0.1) |
| 翻牌配对 | 记住翻过的图案，依次找出相同的两张牌 | [Concentration Room 0.02](https://pineight.com/croom/) |
| Falling | 在标题画面按 Enter 开始，左右躲避下落途中的障碍 | [Falling](https://github.com/xram64/falling-nes/tree/52dcb8a951200562e696dfc2aba5d4d14edd0078) |
| NESnake | 用方向键控制蛇，吃苹果并避开自己的身体 | [NESnake](https://github.com/cyborgx37/nesnake/tree/9ff0a94f7801057a834a07e3effd397d6304e356) |

每款游戏和 WASM 核心的版本、来源、署名和分发条款见[第三方声明](./licenses/NOTICE.txt)。

## 添加卡带

桌面端可将自己的《超级玛丽》iNES 卡带保存为 `assets/super-mario-bros.nes`。运行 `ink-open samples/nes` 时，游戏库会自动将其列为第一项。该本地 ROM 已加入 Git 和 AIX 的忽略列表。

将 iNES 1.0 格式的 `.nes` 文件放入 `assets/`，在 `lib/cartridges.js` 的列表中增加文件名、标题、简介和可选图片。也可通过启动参数把包内文件临时加入游戏库并预选，按 Enter 后才开始运行。

```sh
ink-open samples/nes --query 'rom=puzzle.nes'
```

本示例使用单人手柄和 QuickNES 的 60 Hz 时序，mapper 支持范围取决于随附的核心。打包命令为 `aix pack samples/nes -o nes.aix`。部分 AIX 版本会对读取包内卡带的 `fetch('file:///assets/...')` 报告 AIX033 网络权限提示，这条路径只访问包内文件。

## 重建 WASM

预编译模块在 `assets/nes.wasm`。如需修改核心，激活 Emscripten 4.0.4 环境后，在仓库根目录运行：

```sh
samples/nes/core/build.sh
```

构建脚本解包 `core/quicknes-src.tar.xz`，去掉一条重复的标准错误输出，随后编译 C++ 接口。生成的 WASM 没有宿主导入。归档保留上游提交 `26bb785c` 的 `nes_emu/` 源码与 `LICENSE`，已剔除预编译的 Linux 工具 `nes_emu/tools/proto`。[QuickNES 源码](https://github.com/libretro/QuickNES_Core/tree/26bb785c9deddb66a17717b21bb4e328f03ade32)
