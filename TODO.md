# LucidSelect - TODO & Next Steps

## 🔴 Critical (Do Before Publishing)

- [ ] **Install Dependencies**
  ```bash
  npm cache clean --force
  npm install
  npm install --save-dev archiver
  ```

- [ ] **Test Build**
  ```bash
  npm run build
  # Verify dist/ folder is created successfully
  ```

- [ ] **Test Extension Locally**
  - Load unpacked extension in Chrome from dist/ folder
  - Test all AI models (OpenAI, Claude, Gemini, Together.ai)
  - Test keyboard shortcuts (Alt+Q, Alt+S, Alt+L, Alt+C)
  - Test custom prompts feature
  - Test request history feature
  - Verify dark mode works
  - Test on multiple websites

- [ ] **Create Chrome Web Store Assets**
  - Promotional image 1280x800px (required)
  - Screenshots 1280x800px or 640x400px (at least 1, max 5)
  - Icon 128x128px (already exists)
  - Store description (can adapt from README.md)

## 🟡 Important (Do Soon)

- [ ] **Initialize Git & GitHub**
  ```bash
  git init
  git add .
  git commit -m "feat: initial release v1.0.0"
  git remote add origin https://github.com/OthmaneW37/LucidSelect.git
  git push -u origin main
  ```

- [ ] **Optimize Images**
  - Compress `images/openai-logo.png` (currently 90KB → target ~20KB)
  - Compress `images/together-logo.png` (currently 27KB → target ~10KB)
  - Tool recommendations: TinyPNG, Squoosh, ImageOptim

- [ ] **Add JSDoc Comments**
  - Document functions in `background.js`
  - Document functions in `content.js`
  - Document utility functions in `utils/` folder

- [ ] **Create GitHub Repository**
  - Set up at https://github.com/OthmaneW37/LucidSelect
  - Add topics/tags: `chrome-extension`, `ai`, `chatgpt`, `openai`, `claude`, `gemini`
  - Enable Issues
  - Add description matching package.json
  - Consider enabling GitHub Pages for docs

- [ ] **Chrome Web Store Submission**
  - Create developer account ($5 one-time fee)
  - Prepare promotional materials
  - Submit extension
  - Wait for review (typically 1-3 days)

## 🟢 Nice to Have (Future Enhancements)

### Documentation

- [ ] Add screenshots to README.md
- [ ] Create demo GIF showing extension in action
- [ ] Add FAQ section expansion
- [ ] Create video tutorial (optional)
- [ ] Set up GitHub Wiki (optional)

### Code Quality

- [ ] Set up ESLint auto-fix on commit (husky + lint-staged)
- [ ] Add unit tests for utility functions
- [ ] Add integration tests
- [ ] Set up code coverage reporting
- [ ] Add TypeScript (major refactor, optional)

### CI/CD

- [ ] Create GitHub Actions workflow:
  - Run linting on PRs
  - Run tests on PRs
  - Automated release builds
  - Automated Chrome Web Store publishing

- [ ] Add badges to README:
  - Build status
  - Code coverage
  - License
  - Chrome Web Store version
  - Downloads/installs

### Features

- [ ] Add more prompt templates
- [ ] Implement settings sync across devices
- [ ] Add export/import for settings
- [ ] Add analytics/usage tracking (privacy-respecting)
- [ ] Support for more AI models:
  - Cohere
  - Hugging Face Inference API
  - LLaMA models via Replicate
- [ ] Voice input support
- [ ] PDF text selection support
- [ ] Browser sync of history across devices

### Performance

- [ ] Analyze bundle size and optimize further
- [ ] Implement service worker caching
- [ ] Add request debouncing
- [ ] Optimize CSS delivery
- [ ] Consider lazy loading UI components

### UX Improvements

- [ ] Add onboarding tutorial for first-time users
- [ ] Implement tooltip hints
- [ ] Add more themes (not just dark/light)
- [ ] Improve error messages
- [ ] Add loading skeletons
- [ ] Implement keyboard navigation throughout UI

### Accessibility

- [ ] Full keyboard navigation audit
- [ ] Screen reader compatibility testing
- [ ] Color contrast audit (WCAG AA compliance)
- [ ] Add ARIA landmarks
- [ ] Test with multiple accessibility tools

### Internationalization

- [ ] Add more language translations
  - Spanish (es)
  - German (de)
  - Italian (it)
  - Portuguese (pt)
  - Japanese (ja)
  - Chinese (zh)
- [ ] Allow community to contribute translations
- [ ] Set up Crowdin or similar for translations

### Marketing & Community

- [ ] Create landing page (GitHub Pages or separate site)
- [ ] Write blog post/article about the extension
- [ ] Submit to Product Hunt
- [ ] Post on Reddit (r/chrome, r/ChatGPT, etc.)
- [ ] Create Twitter/X account for updates
- [ ] Set up Discord community (optional)

### Analytics (Privacy-First)

- [ ] Implement opt-in analytics
  - Most used AI models
  - Most used features
  - Error rates
- [ ] Create privacy policy
- [ ] Allow users to export their data
- [ ] GDPR compliance considerations

## 📋 Ongoing Maintenance

- [ ] Monitor Chrome Web Store reviews
- [ ] Respond to GitHub issues promptly
- [ ] Keep dependencies updated (monthly)
- [ ] Security audits (quarterly)
- [ ] Update CHANGELOG.md with each release
- [ ] Test with new Chrome versions
- [ ] Monitor AI API changes and update accordingly

## 🎯 Version Roadmap

### v1.1.0 (Next Minor Release)
- Improved error handling
- More prompt templates
- UI/UX refinements based on user feedback
- Bug fixes from initial release

### v1.2.0
- Additional AI model support
- Enhanced history features (search, filters, export)
- Performance optimizations

### v2.0.0 (Future Major Release)
- Complete UI redesign
- Advanced features (team collaboration, sync)
- Premium features (optional)
- Mobile browser support (if feasible)

## 📝 Notes

- **Priority Order**: Critical → Important → Nice to Have
- **Version Numbering**: Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- **Release Frequency**: Aim for monthly updates initially
- **User Feedback**: Prioritize based on user requests and bug reports
- **Community**: Encourage contributions via CONTRIBUTING.md

---

**Last Updated**: 2026-01-01

*This TODO list is a living document. Update it as tasks are completed and new priorities emerge.*
