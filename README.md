# ChatGPT Voyager

ChatGPT Voyager 是面向 **ChatGPT 网页版** 的全功能增强扩展，提供时间轴、文件夹、提示词库、导出等能力。项目 **参考并基于 Gemini Voyager** 进行适配与重构。

## Badges

![CI](https://img.shields.io/github/actions/workflow/status/hayashishungenn/chatgpt-voyager/ci.yml?style=flat-square)
![Release](https://img.shields.io/github/v/release/hayashishungenn/chatgpt-voyager?style=flat-square)
![License](https://img.shields.io/github/license/hayashishungenn/chatgpt-voyager?style=flat-square)
![Chrome](https://img.shields.io/badge/Chrome-✓-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-✓-0078D7?style=flat-square&logo=microsoftedge&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-✓-FF7139?style=flat-square&logo=firefox&logoColor=white)

## Table of Contents

- [功能特点](#功能特点)
- [安装步骤](#安装步骤)
- [使用方法](#使用方法)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)
- [致谢](#致谢)
- [许可证](#许可证)

## 功能特点

- **时间轴导航**：可视化节点快速跳转、收藏关键消息。
- **文件夹管理**：拖拽整理对话，支持二级结构与排序。
- **提示词库**：保存、分类、复用高频提示词。
- **聊天导出**：导出 JSON / Markdown / PDF，便于沉淀知识。
- **引用回复**：选择文本一键引用回复。
- **公式复制**：一键复制 LaTeX / MathML。
- **Mermaid 渲染**：自动渲染流程图与时序图。
- **深度研究提取**：提取 Deep Research 过程与参考链接。
- **界面增强**：输入框折叠、聊天宽度与侧边栏宽度调整等。

## 安装步骤

### 1) 发布版安装（推荐）

Release 页面提供 **浏览器可识别的压缩包**：

- **Chrome / Edge / 其他 Chromium**：`chatgpt-voyager-chrome-vX.Y.Z.zip`
- **Firefox**：`chatgpt-voyager-firefox-vX.Y.Z.xpi`

安装方式：

- **Chrome / Edge**：解压 ZIP 后进入 `chrome://extensions` 或 `edge://extensions`，开启开发者模式并“加载已解压的扩展”。
- **Firefox**：打开 `about:addons` → 齿轮 → “从文件安装”，选择 `.xpi`。

### 2) 开发安装

前置：建议安装 **Bun**（或 Node 18+）。

```bash
bun i
bun run dev:chrome   # Chrome / Edge
bun run dev:firefox  # Firefox
```

构建产物：

```bash
bun run build:chrome
bun run build:firefox
```

## 使用方法

- 打开 `https://chatgpt.com` 或 `https://chat.openai.com`。
- 点击扩展图标进入设置面板，按需启用/调整功能。
- 在对话页可使用时间轴、文件夹、导出等功能按钮。

## 项目结构

以下目录树由 `tree /A /F` 生成并做了适度截取：

```text
Folder PATH listing
C:.
|   README.md
|   package.json
|   manifest.json
|   manifest.dev.json
|   vite.config.chrome.ts
|   vite.config.firefox.ts
|   vite.config.safari.ts
|   
+---public
|       contentStyle.css
|       icon-128.png
|       katex-config.js
|       fetchInterceptor.js
|       
+---src
|   |   global.d.ts
|   |   vite-env.d.ts
|   |   
|   +---core
|   |   +---services
|   |   +---types
|   |   \---utils
|   |   
|   +---features
|   |   +---backup
|   |   +---contextSync
|   |   +---export
|   |   +---folder
|   |   \---formulaCopy
|   |   
|   +---pages
|   |   +---background
|   |   +---content
|   |   +---options
|   |   +---panel
|   |   \---popup
|   |   
|   +---locales
|   |   \---en
|   |   
|   \---utils
|       i18n.ts
|       language.ts
|       translations.ts
|       
+---docs
+---safari
```

## 贡献指南

欢迎贡献！你可以通过以下方式参与：

1. Fork 本仓库并创建分支：`feat/xxx` 或 `fix/xxx`。
2. 运行 `bun run lint` / `bun run test` / `bun run typecheck` 确保通过。
3. 提交 PR 并描述变更内容与动机。

更多细节参考 `./.github/CONTRIBUTING.md`。

## 致谢

- **Gemini Voyager**：本项目参考并基于其设计与实现。
- **ChatGPT Conversation Timeline**：时间轴功能的早期灵感来源。

## 许可证

本项目采用 **MIT License**，详见 `LICENSE`。
