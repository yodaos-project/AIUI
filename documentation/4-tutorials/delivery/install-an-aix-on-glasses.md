# 把 AIX 包安装到眼镜

把已有的 `hello-aiui.aix` 安装到支持 AIUI 开发模式的 Rokid 眼镜。准备 AIX CLI 和 ADB，用 USB 连接一台眼镜，允许 USB 调试并启用开发者模式。

## 将已有 AIX 包安装到设备

<!-- aiui-tutorial-step -->

先用 `adb devices` 确认眼镜处于 `device` 状态。只有一台已授权且在线的设备时，CLI 会自动选择它。如果 `aix device` 显示开发者模式已关闭，先执行 `aix device set-dev`。进入包所在目录，再执行安装。

```bash
adb devices
aix install ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

## 验证效果

等待终端显示安装成功和智能体标识。再运行 `aix device`，核对已安装列表。若连接了多台设备，可在安装命令末尾加上 `--serial` 和目标眼镜的序列号。

开发模式与设备命令参见[命令行工具](/AIUI/tools/cli)。
