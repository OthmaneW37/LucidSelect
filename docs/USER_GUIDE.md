# LucidSelect User Guide

Welcome to LucidSelect! This guide will help you get started and make the most of this powerful AI-powered text analysis extension.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [Configuration](#configuration)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [AI Models](#ai-models)
7. [Custom Prompts](#custom-prompts)
8. [Request History](#request-history)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Installation

### From Chrome Web Store (Recommended)

1. Visit the [LucidSelect Chrome Web Store page](https://chrome.google.com/webstore/detail/lucidselect/your-id)
2. Click **"Add to Chrome"**
3. Confirm the installation when prompted
4. The LucidSelect icon will appear in your browser toolbar

### Developer Mode (For Testing)

1. Download the latest release from the [GitHub repository](https://github.com/your-username/LucidSelect)
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `dist` folder from the downloaded files
6. The extension is now installed

---

## Getting Started

### Step 1: Configure API Keys

Before using LucidSelect, you need to add API keys for the AI models you want to use.

1. Click the LucidSelect icon in your toolbar
2. Click **"Options"** or right-click the icon and select **"Options"**
3. Navigate to the **"AI Models"** tab
4. Enter your API keys:
   - **OpenAI**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic (Claude)**: Get from [console.anthropic.com](https://console. anthropic.com)
   - **Google (Gemini)**: Get from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - **Together.ai**: Get from [api.together.xyz/settings/api-keys](https://api.together.xyz/settings/api-keys)
5. Click **"Save"**

### Step 2: Your First Query

1. Navigate to any webpage
2. Select some text
3. Right-click and choose **"Ask LucidSelect"**
4. Type your question in the prompt
5. Press Enter or click **"Submit"**
6. The AI response will appear in a bubble near your selection

---

## Features

### 🖱️ Context Menu Integration

Right-click on any selected text to access LucidSelect options:
- **Ask LucidSelect**: Ask a custom question about the selected text
- **Summarize**: Get a quick summary
- **Explain**: Get a detailed explanation
- **Translate**: Translate to another language

### 💬 Inline Answer Bubbles

Responses appear directly on the page in an elegant, dismissible bubble:
- **Position**: Appears near your text selection
- **Dismissible**: Click the × to close
- **Copyable**: Click to copy the response
- **Resizable**: Drag the corner to resize

### 📜 Request History

All your queries and responses are saved:
- Access via **Options → History**
- Search through past queries
- Export history as JSON
- Clear individual items or entire history

### 📝 Custom Prompt Templates

Create reusable prompt templates:
- Access via **Options → Custom Prompts**
- Pre-defined templates: Summarize, Explain, Translate, Analyze
- Create your own custom templates
- Use variables: `{text}`, `{question}`

### 🌐 Multilingual Interface

Switch the interface language:
- Access via **Options → Language Settings**
- Supported languages: English, French, Spanish, German
- Language persists across browser sessions

### ⌨️ Keyboard Shortcuts

Quick access without using the mouse (see [Keyboard Shortcuts](#keyboard-shortcuts) section)

---

## Configuration

### General Settings

**Options → General**

- **Default AI Model**: Choose which AI model to use by default
- **Auto-save History**: Automatically save all queries
- **Show Notifications**: Enable/disable success notifications
- **Theme**: Light, Dark, or Auto (follows system)

### AI Model Settings

**Options → AI Models**

Configure each AI provider:

#### OpenAI
- **API Key**: Your OpenAI API key
- **Model**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Temperature**: 0.0 (precise) to 1.0 (creative)
- **Max Tokens**: Maximum response length (default: 500)

#### Anthropic (Claude)
- **API Key**: Your Anthropic API key
- **Model**: Claude 3 Opus, Sonnet, or Haiku
- **Temperature**: 0.0 to 1.0
- **Max Tokens**: Maximum response length

#### Google (Gemini)
- **API Key**: Your Google API key
- **Model**: Gemini Pro or Gemini Ultra
- **Temperature**: 0.0 to 1.0

#### Together.ai
- **API Key**: Your Together.ai API key
- **Model**: Various open-source models
- **Temperature**: 0.0 to 1.0

### Privacy Settings

**Options → Privacy**

- **Sync Settings**: Sync settings across devices (via Chrome sync)
- **Clear History**: Delete all saved queries
- **Export Data**: Export your data as JSON

---

## Keyboard Shortcuts

| Shortcut | Action                             |
|----------|-------------------------------------|
| `Alt+Q`  | Open LucidSelect popup             |
| `Alt+S`  | Ask question on selected text      |
| `Alt+L`  | Answer selected question           |
| `Alt+C`  | Open chat with ChatGPT             |

### Customizing Shortcuts

1. Go to `chrome://extensions/shortcuts`
2. Find **LucidSelect**
3. Click the pencil icon next to each shortcut
4. Press your desired key combination
5. Click **OK**

---

## AI Models

### OpenAI (GPT)

**Best for**: General-purpose queries, creative writing, code generation

**Models**:
- **GPT-3.5-turbo**: Fast, cost-effective, great for most tasks
- **GPT-4**: Most capable, best reasoning, slower and more expensive
- **GPT-4-turbo**: Balanced performance and cost

**Pricing**: Pay-per-token (check [OpenAI pricing](https://openai.com/pricing))

### Anthropic (Claude)

**Best for**: Long-form content, nuanced analysis, safety-focused responses

**Models**:
- **Claude 3 Opus**: Most capable, best for complex tasks
- **Claude 3 Sonnet**: Balanced performance
- **Claude 3 Haiku**: Fastest, most cost-effective

**Pricing**: Pay-per-token (check [Anthropic pricing](https://anthropic.com/pricing))

### Google (Gemini)

**Best for**: Multimodal tasks, fast responses, free tier available

**Models**:
- **Gemini Pro**: Free tier available, fast responses
- **Gemini Ultra**: Most capable (limited availability)

**Pricing**: Free tier available, then pay-per-token

### Together.ai

**Best for**: Open-source models, cost-effective, variety of options

**Models**: Llama 2, Mistral, CodeLlama, and many more

**Pricing**: Very cost-effective (check [Together.ai pricing](https://together.ai/pricing))

---

## Custom Prompts

Custom prompts let you create reusable templates for common tasks.

### Creating a Custom Prompt

1. Go to **Options → Custom Prompts**
2. Click **"+ New Prompt"**
3. Fill in the details:
   - **Name**: E.g., "Summarize for a 5-year-old"
   - **Prompt Template**: E.g., "Explain this like I'm 5: {text}"
   - **Variables**: Use `{text}` for selected text, `{question}` for user input
4. Click **"Save"**

### Using Custom Prompts

1. Select text on any webpage
2. Right-click → **"LucidSelect"** → **"Your Custom Prompt Name"**
3. The prompt will be sent automatically

### Example Prompts

```
Name: Technical Summary
Template: Provide a technical summary of the following text in 3 bullet points: {text}

Name: Simplify
Template: Simplify this text for a general audience: {text}

Name: Find Issues
Template: Identify any logical issues or inconsistencies in: {text}

Name: Translate to Spanish
Template: Translate the following to Spanish: {text}
```

---

## Request History

All your queries are automatically saved (if enabled in settings).

### Viewing History

1. Click the LucidSelect icon
2. Select **"View History"** or go to **Options → History**
3. Browse your past queries

### Searching History

- Use the search bar to filter by keywords
- Results update in real-time

### Exporting History

1. Go to **Options → History**
2. Click **"Export"**
3. Choose JSON format
4. Save the file

### Clearing History

**Clear Individual Items**:
- Hover over an item
- Click the trash icon

**Clear All History**:
- Go to **Options → History**
- Click **"Clear All"**
- Confirm the action

---

## Troubleshooting

### Extension Not Working

**Check**:
1. Extension is enabled in `chrome://extensions`
2. Page has been refreshed after installation
3. No conflicting extensions

### API Errors

**"Invalid API Key"**:
- Verify your API key in Options
- Ensure no extra spaces
- Check key is active in provider dashboard

**"Rate Limit Exceeded"**:
- You've exceeded your API usage quota
- Wait a few minutes or upgrade your plan

**"Model Not Available"**:
- Selected model requires higher tier
- Choose a different model

### Response Not Appearing

1. Check browser console for errors (F12)
2. Disable other extensions temporarily
3. Try a different website
4. Reload the page

### Performance Issues

- Disable request history if you have thousands of items
- Use a faster AI model (GPT-3.5, Claude Haiku)
- Reduce max tokens in model settings

---

## FAQ

**Q: Is my data private?**  
A: Yes. Your API keys are stored locally and encrypted. Selected text is only sent to the AI provider you choose. We don't collect or store your queries on external servers.

**Q: Do I need all API keys?**  
A: No. You only need keys for the AI models you want to use. You can use just one.

**Q: How much does it cost?**  
A: LucidSelect is free. You pay only for your AI API usage directly to the providers (OpenAI, Anthropic, etc.).

**Q: Can I use it offline?**  
A: No. AI models require internet connection to process queries.

**Q: Does it work on all websites?**  
A: Yes, except some restricted pages like chrome:// URLs and certain banking sites.

**Q: Can I customize the appearance?**  
A: Yes, you can switch between light/dark themes in Options.

**Q: Is there a mobile version?**  
A: Not yet. Currently available only for Chrome desktop.

**Q: How do I report bugs?**  
A: Please open an issue on our [GitHub repository](https://github.com/your-username/LucidSelect/issues).

---

## Need More Help?

- 📖 [Read the README](https://github.com/your-username/LucidSelect)
- 🐛 [Report a Bug](https://github.com/your-username/LucidSelect/issues)
- 💡 [Request a Feature](https://github.com/your-username/LucidSelect/issues)
- 🔒 [Security Concerns](https://github.com/your-username/LucidSelect/security)

---

Happy exploring with LucidSelect! 🚀
