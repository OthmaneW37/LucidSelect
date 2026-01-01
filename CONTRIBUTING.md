# Contributing to LucidSelect

Thank you for your interest in contributing to LucidSelect! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/LucidSelect.git
   cd LucidSelect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```
   This starts webpack in watch mode for automatic rebuilding.

4. **Load Extension in Chrome**
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Code Style

### JavaScript
- Use ES6+ features (const/let, arrow functions, async/await)
- Follow ESLint rules: `npm run lint`
- Use meaningful variable names
- Add JSDoc comments for functions

```javascript
/**
 * Sends a query to the AI model
 * @param {string} text - The text to analyze
 * @param {string} question - The question to ask
 * @returns {Promise<string>} The AI response
 */
async function queryAI(text, question) {
  // Implementation
}
```

### CSS
- Use BEM naming convention when appropriate
- Keep specificity low
- Use CSS variables for theming
- Mobile-first responsive design

### HTML
- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- All images must have alt text

## Project Structure

```
LucidSelect/
├── background.js           # Service worker for background tasks
├── content.js              # Content script injected into pages
├── chatgpt-inject.js       # Special handling for ChatGPT pages
├── popup.js/popup.html     # Extension popup UI
├── options.js/options.html # Settings page
├── utils/                  # Utility modules
│   ├── ai-models.js        # AI model integrations
│   ├── constants.js        # App constants
│   ├── history.js          # Request history
│   ├── custom-prompts.js   # Prompt management
│   └── i18n.js             # Internationalization
├── ui/                     # UI components
├── workers/                # Web Workers
└── pages/                  # Additional HTML pages
```

## Making Changes

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow Conventional Commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Build/tooling

**Examples:**
```
feat(ai-models): add support for Mistral AI
fix(popup): resolve API key validation issue
docs(readme): update installation instructions
```

## Pull Request Process

1. **Before Submitting**
   - Ensure code passes linting: `npm run lint`
   - Test in Chrome browser
   - Update documentation if needed
   - Add yourself to contributors if first PR

2. **PR Description**
   - Clearly describe what changes were made
   - Reference any related issues
   - Include screenshots for UI changes
   - List any breaking changes

3. **Review Process**
   - Address reviewer feedback
   - Keep PRs focused and small
   - Squash commits if requested

## Testing

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Text selection works on multiple websites
- [ ] All AI models respond correctly
- [ ] Settings persist correctly
- [ ] Keyboard shortcuts work
- [ ] No console errors
- [ ] Works on both HTTP and HTTPS sites

### Browser Testing
Test on:
- Chrome (latest)
- Edge (latest)
- Brave (optional)

## Adding New Features

### New AI Model Integration
1. Add model configuration to `utils/constants.js`
2. Implement API call in `utils/ai-models.js`
3. Add UI controls in `ui/ai-models-ui.js`
4. Update documentation
5. Test thoroughly

### New Language Support
1. Add translations to `utils/i18n.js`
2. Test UI with new language
3. Update language switcher

## Performance Guidelines

- Use Web Workers for intensive tasks
- Lazy load non-critical features
- Minimize bundle size
- Optimize images (< 30KB recommended)
- Profile memory usage

## Security Guidelines

- Never log API keys
- Sanitize user input
- Use HTTPS for all API calls
- Follow Chrome extension security best practices
- Report security issues privately to maintainers

## Documentation

- Update README.md for user-facing changes
- Update this CONTRIBUTING.md for developer changes
- Add JSDoc comments to new functions
- Update CHANGELOG.md

## Questions?

- Open an issue for bugs or feature requests
- Tag maintainers for urgent matters
- Be patient and respectful

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to LucidSelect! 🚀
