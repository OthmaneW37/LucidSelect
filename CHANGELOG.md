# Changelog

All notable changes to LucidSelect will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-01

### Added
- 🖱️ **Context Menu Integration**: Right-click on selected text to ask questions
- 🧠 **Multi-Model AI Support**: 
  - OpenAI (GPT-3.5, GPT-4)
  - Anthropic Claude (Claude 3 Opus, Sonnet, Haiku)
  - Google Gemini (Gemini Pro, Gemini Ultra)
  - Together.ai (Various open-source models)
- 💬 **Inline Answer Bubbles**: AI responses appear directly on the page
- 📜 **Request History**: Save and review past queries and responses
- 📝 **Custom Prompt Templates**: Create and save reusable prompt templates
- 🌐 **Multilingual Interface**: Support for multiple languages
- ⚡ **Performance Optimizations**:
  - Web Workers for background processing
  - Lazy loading of features
  - Webpack bundle optimization
  - Code splitting for faster load times
- ⌨️ **Keyboard Shortcuts**:
  - `Alt+Q`: Open popup
  - `Alt+S`: Ask question on selection
  - `Alt+L`: Answer selected question
  - `Alt+C`: Open ChatGPT chat
- 🎨 **Modern UI/UX**:
  - Clean, responsive design
  - Dark mode support
  - Smooth animations
  - Accessibility features
- 🔐 **Secure API Key Storage**: Encrypted storage using Chrome's storage API
- 📋 **ChatGPT Integration**: Special handling for ChatGPT pages

### Security
- Secure API key storage using chrome.storage.sync
- Input sanitization for user queries
- HTTPS-only API communication

### Performance
- Bundle size optimization with Webpack
- Lazy loading of non-critical features
- Web Workers for API calls and text processing
- CSS and JavaScript minification

### Developer Experience
- ESLint and Prettier for code quality
- Webpack dev mode with hot reloading
- Comprehensive build system
- Babel for modern JavaScript support

## [Unreleased]

### Planned
- Browser sync across devices
- Offline mode with cached responses
- Voice input support
- PDF text selection support
- Custom AI model endpoints
- Team collaboration features
- Analytics dashboard

---

For more details about each release, visit the [releases page](https://github.com/your-username/LucidSelect/releases).
