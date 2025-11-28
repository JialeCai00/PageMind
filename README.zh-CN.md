# Page Mind 🧠

[![Chrome 网上应用店](https://img.shields.io/badge/Chrome-扩展-blue)](https://chrome.google.com/webstore)
[![许可证](https://img.shields.io/badge/许可证-MIT-green)](LICENSE)

> 一个由 AI 驱动的 Chrome 扩展，让你可以使用 OpenAI 的 GPT 模型与任何网页对话。

中文 | **[English](README.md)**

## ✨ 功能特性

- 🤖 **AI 对话** - 使用 GPT-4o-mini 与网页内容对话
- 📄 **自动内容提取** - 自动提取并分析网页内容
- 💬 **上下文对话** - 保持对话历史，实现自然交流
- ⚡ **实时流式输出** - 实时查看 AI 生成的回复
- 🎨 **Markdown 支持** - 支持 Markdown 格式的精美排版
- 🔒 **隐私优先** - API 密钥仅保存在本地浏览器中

## 🎥 演示

![Page Mind 演示](https://via.placeholder.com/800x450?text=演示截图)

## 🚀 快速开始

### 前置要求

- Node.js 16+ 和 pnpm
- OpenAI API 密钥（[在这里获取](https://platform.openai.com/api-keys)）
- Chrome/Edge 浏览器

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/PageMind.git
   cd PageMind
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **启动开发服务器**
   ```bash
   pnpm dev
   ```

4. **在 Chrome 中加载扩展**
   - 打开 Chrome 并访问 `chrome://extensions/`
   - 启用"开发者模式"（右上角）
   - 点击"加载已解压的扩展程序"
   - 选择 `build/chrome-mv3-dev` 文件夹

5. **输入你的 OpenAI API 密钥**
   - 点击扩展图标
   - 在输入框中输入你的 API 密钥
   - 开始与任何网页对话！

## 📖 使用方法

1. **访问任何网页** - 你想要分析的网页
2. **点击扩展图标** - 打开聊天界面
3. **扩展会自动读取** 页面内容
4. **提问**，例如：
   - "用 3 个要点总结这篇文章"
   - "这个页面的主要论点是什么？"
   - "用简单的话解释这个概念"
   - "有哪些关键要点？"

## 🛠️ 开发

### 项目结构

```
PageMind/
├── src/
│   ├── popup.tsx          # 主聊天界面
│   ├── background.ts      # 后台服务工作线程
│   ├── contents/          # 内容脚本
│   └── style.css          # 全局样式
├── assets/                # 扩展图标
├── package.json           # 依赖配置
└── tsconfig.json          # TypeScript 配置
```

### 技术栈

- [Plasmo](https://www.plasmo.com/) - 浏览器扩展框架
- [React](https://react.dev/) - UI 框架
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI 流式处理工具
- [OpenAI API](https://platform.openai.com/) - GPT 模型
- [TypeScript](https://www.typescriptlang.org/) - 类型安全

### 构建生产版本

```bash
pnpm build
```

生产就绪的扩展将位于 `build/chrome-mv3-prod/` 目录中。

### 打包发布

```bash
pnpm package
```

这会创建一个准备提交到 Chrome 网上应用店的 ZIP 文件。

## 🎯 功能详解

### 自动内容提取
扩展智能地从以下元素提取文本：
- 段落（`<p>`）
- 标题（`<h1>`, `<h2>`, `<h3>`）
- 列表项（`<li>`）
- 文章（`<article>`）

### 上下文感知对话
- 保持完整的对话历史
- AI 记住之前的问题和答案
- 自然流畅的对话体验

### 流式响应
- 使用服务器发送事件（SSE）实现实时文本生成
- 实时查看响应内容
- 无需等待完整响应

### Markdown 渲染
- AI 响应的精美格式化
- 支持标题、列表、代码块等
- 清晰易读的界面

## 🔐 隐私与安全

- ✅ 你的 API 密钥**仅在本地**存储在 Chrome 同步存储中
- ✅ 数据不会发送到第三方服务器（OpenAI 除外）
- ✅ 无追踪或分析
- ✅ 开源 - 可以自行检查代码

## 📋 系统要求

- Chrome/Edge 浏览器（Manifest V3）
- 拥有 GPT-4 或 GPT-3.5 访问权限的 OpenAI API 密钥
- 互联网连接

## 🐛 故障排除

### 扩展无法加载？
- 确保选择了正确的文件夹（`build/chrome-mv3-dev`）
- 尝试在 `chrome://extensions` 中刷新扩展

### API 错误？
- 验证你的 API 密钥是否正确
- 检查你的 OpenAI 账户是否有余额
- 确保已启用 API 访问

### 内容无法提取？
- 某些页面有限制（例如 `chrome://` 页面）
- 尝试刷新页面
- 检查浏览器控制台是否有错误

## 🤝 贡献

欢迎贡献！你可以：

1. Fork 这个仓库
2. 创建特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交你的更改（`git commit -m '添加一些很棒的功能'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 打开一个 Pull Request

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 使用 [Plasmo Framework](https://www.plasmo.com/) 构建
- 由 [OpenAI](https://openai.com/) 提供支持
- UI 灵感来自现代聊天界面

## 📞 支持

- 🐛 [报告 Bug](https://github.com/yourusername/PageMind/issues)
- 💡 [请求功能](https://github.com/yourusername/PageMind/issues)
- 📧 联系：your.email@example.com

---

用 ❤️ 制作，作者：[Your Name](https://github.com/yourusername)

