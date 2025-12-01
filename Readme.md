# Page Mind 🧠

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue)](https://chrome.google.com/webstore)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> An AI-powered Chrome extension that lets you chat with any webpage using OpenAI's GPT models.

**[中文文档](README.zh-CN.md)** | English

## ✨ Features

- 🤖 **AI-Powered Conversations** - Chat with webpage content using GPT-4o-mini
- 📄 **Auto Content Extraction** - Automatically extracts and analyzes webpage content
- 💬 **Context-Aware Chat** - Maintains conversation history for natural dialogue
- ⚡ **Real-time Streaming** - See AI responses as they're generated
- 🎨 **Markdown Support** - Beautiful formatting with markdown rendering
- 🔒 **Privacy First** - API key stored locally in your browser

## 🎥 Demo

![Page Mind Demo](https://via.placeholder.com/800x450?text=Demo+Screenshot)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and pnpm
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
- Chrome/Edge browser

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/PageMind.git
   cd PageMind
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Load extension in Chrome**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-dev` folder

5. **Enter your OpenAI API Key**
   - Click the extension icon
   - Enter your API key in the input field
   - Start chatting with any webpage!

## 📖 Usage

1. **Navigate to any webpage** you want to analyze
2. **Click the extension icon** to open the chat interface
3. **The extension automatically reads** the page content
4. **Ask questions** like:
   - "Summarize this article in 3 bullet points"
   - "What is the main argument of this page?"
   - "Explain this concept in simple terms"
   - "What are the key takeaways?"

## 🛠️ Development

### Project Structure

```
PageMind/
├── src/
│   ├── popup.tsx          # Main chat interface
│   ├── background.ts      # Background service worker
│   ├── contents/          # Content scripts
│   └── style.css          # Global styles
├── assets/                # Extension icons
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

### Built With

- [Plasmo](https://www.plasmo.com/) - Browser extension framework
- [React](https://react.dev/) - UI framework
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI streaming utilities
- [OpenAI API](https://platform.openai.com/) - GPT models
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### Build for Production

```bash
pnpm build
```

The production-ready extension will be in `build/chrome-mv3-prod/`.

### Package for Distribution

```bash
pnpm package
```

This creates a ZIP file ready for Chrome Web Store submission.

## 🎯 Features in Detail

### Auto Content Extraction

The extension intelligently extracts text from:

- Paragraphs (`<p>`)
- Headings (`<h1>`, `<h2>`, `<h3>`)
- List items (`<li>`)
- Articles (`<article>`)

### Context-Aware Conversations

- Maintains full conversation history
- AI remembers previous questions and answers
- Natural, flowing dialogue experience

### Streaming Responses

- Real-time text generation using Server-Sent Events (SSE)
- See responses as they're written
- No waiting for complete responses

### Markdown Rendering

- Beautiful formatting for AI responses
- Supports headers, lists, code blocks, and more
- Clean, readable interface

## 🔐 Privacy & Security

- ✅ Your API key is stored **locally** in Chrome sync storage
- ✅ No data is sent to third-party servers (except OpenAI)
- ✅ No tracking or analytics
- ✅ Open source - inspect the code yourself

## 📋 Requirements

- Chrome/Edge browser (Manifest V3)
- OpenAI API key with GPT-4 or GPT-3.5 access
- Internet connection

## 🐛 Troubleshooting

### Extension not loading?

- Make sure you selected the correct folder (`build/chrome-mv3-dev`)
- Try refreshing the extension in `chrome://extensions`

### API errors?

- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure you have API access enabled

### Content not extracting?

- Some pages have restrictions (e.g., `chrome://` pages)
- Try refreshing the page
- Check browser console for errors

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Plasmo Framework](https://www.plasmo.com/)
- Powered by [OpenAI](https://openai.com/)
- UI inspired by modern chat interfaces

## 📞 Support

- 🐛 [Report bugs](https://github.com/yourusername/PageMind/issues)
- 💡 [Request features](https://github.com/yourusername/PageMind/issues)
- 📧 Contact: your.email@example.com

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
