<div align="center">

# 📘 LucidSelect

**AI-Powered Text Analysis Directly in Your Browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](https://github.com/OthmaneW37/LucidSelect/releases)

Select. Ask. Understand. Instantly.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 What is LucidSelect?

LucidSelect is a powerful Chrome extension that brings AI assistance directly to your browsing experience. Select any text on any webpage, ask a question, and instantly receive intelligent AI-generated answers displayed right where you need them.

No more switching tabs, copying text, or leaving your workflow. LucidSelect integrates seamlessly with multiple AI providers to give you instant insights, explanations, summaries, and translations.

---

## ✨ Features

### 🧠 **Multiple AI Model Support**
- **OpenAI (GPT-3.5, GPT-4)**: Industry-leading AI for general tasks
- **Anthropic Claude (Opus, Sonnet, Haiku)**: Advanced reasoning and safety
- **Google Gemini (Pro, Ultra)**: Fast, multimodal capabilities
- **Together.ai**: Cost-effective open-source models

### 🎨 **Seamless User Experience**
- 💬 **Inline Answer Bubbles**: Responses appear directly on the page
- 🖱️ **Right-Click Integration**: Access AI through the context menu
- ⌨️ **Keyboard Shortcuts**: Quick access for power users
- 🌓 **Dark Mode**: Easy on the eyes, day or night
- 🌐 **Multilingual Interface**: Use in your preferred language

### 🚀 **Productivity Features**
- 📜 **Request History**: Save and review all your queries
- 📝 **Custom Prompts**: Create reusable templates for common tasks
- ⚡ **Performance Optimized**: Web Workers for smooth performance
- 🔐 **Secure Storage**: Encrypted API key storage

### 🎯 **Smart Capabilities**
- Explain complex concepts
- Summarize long articles
- Translate text instantly
- Analyze code snippets
- Get research assistance
- Answer contextual questions

---

## 📦 Installation

### From Chrome Web Store (Recommended)

1. Visit the [LucidSelect Chrome Web Store page](https://chrome.google.com/webstore/detail/lucidselect/your-id)
2. Click **"Add to Chrome"**
3. Follow the prompts to install
4. Configure your API keys in the extension options

### For Developers

```bash
# Clone the repository
git clone https://github.com/OthmaneW37/LucidSelect.git
cd LucidSelect

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

---

## 🚀 Quick Start

### 1. Get API Keys

You'll need at least one API key from these providers:

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)
- **Google**: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Together.ai**: [api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys)

### 2. Configure Extension

1. Click the LucidSelect icon in your browser toolbar
2. Go to **Options** → **AI Models**
3. Enter your API key(s)
4. Choose your preferred default model
5. Click **Save**

### 3. Start Using

**Method 1: Right-Click**
1. Select any text on a webpage
2. Right-click and choose **"Ask LucidSelect"**
3. Type your question
4. Get instant AI response

**Method 2: Keyboard Shortcut**
1. Select text
2. Press `Alt+S`
3. Ask your question
4. View the response

---

## 💡 Usage Examples

### Explain Technical Concepts
```
Selected Text: "Quantum entanglement is a physical phenomenon..."
Question: "Explain this in simple terms"
Response: "Quantum entanglement is when two particles become connected..."
```

### Summarize Articles
```
Selected Text: [Long article about climate change]
Question: "Summarize in 3 bullet points"
Response: 
• Global temperatures rising due to greenhouse gases
• Extreme weather events becoming more frequent
• Urgent action needed to reduce emissions
```

### Translate Text
```
Selected Text: "Hello, how are you today?"
Question: "Translate to French"
Response: "Bonjour, comment allez-vous aujourd'hui ?"
```

### Code Analysis
```
Selected Text: [JavaScript function]
Question: "What does this code do and how can I improve it?"
Response: "This function calculates factorial recursively. You could optimize it using..."
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action                        |
|----------|-------------------------------|
| `Alt+Q`  | Open LucidSelect popup        |
| `Alt+S`  | Ask question on selection     |
| `Alt+L`  | Answer selected question      |
| `Alt+C`  | Open ChatGPT chat             |

*Customize shortcuts at `chrome://extensions/shortcuts`*

---

## 🔧 Tech Stack

- **Framework**: Chrome Extension Manifest V3
- **Language**: JavaScript (ES6+)
- **Build Tool**: Webpack 5
- **Code Quality**: ESLint, Prettier
- **Performance**: Web Workers, Code Splitting
- **APIs**: OpenAI, Anthropic, Google Gemini, Together.ai

---

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md)**: Comprehensive usage instructions
- **[Contributing Guide](CONTRIBUTING.md)**: How to contribute
- **[Changelog](CHANGELOG.md)**: Version history
- **[Security Policy](SECURITY.md)**: Security guidelines

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

```bash
# Start development mode (watch mode)
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

---

## 🔒 Privacy & Security

- ✅ **Local Storage**: API keys stored securely using Chrome's encrypted storage
- ✅ **No Data Collection**: We don't collect or store your queries
- ✅ **Direct API Calls**: Your data goes directly to your chosen AI provider
- ✅ **HTTPS Only**: All API communications use secure HTTPS
- ✅ **Open Source**: Full code transparency

For more details, see our [Security Policy](SECURITY.md).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude
- Google for Gemini
- Together.ai for open-source model access
- All contributors and users

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/OthmaneW37/LucidSelect/issues)
- 💡 **Feature Requests**: [Request a feature](https://github.com/OthmaneW37/LucidSelect/issues)
- 📧 **Contact**: [Email us](mailto:your-email@example.com)

---

<div align="center">

Made with ❤️ by the LucidSelect Team

[⬆ Back to Top](#-lucidselect)

</div>
 
