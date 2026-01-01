# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in LucidSelect, please report it by emailing the maintainers directly. We take all security reports seriously.

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if available)
- Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (critical issues within 7 days)

## Security Best Practices for Users

### API Key Security

1. **Never Share API Keys**: Your API keys are private credentials
2. **Use Separate Keys**: Consider using different API keys for different extensions
3. **Monitor Usage**: Regularly check your API usage in provider dashboards
4. **Rotate Keys**: Periodically rotate your API keys
5. **Revoke Compromised Keys**: Immediately revoke any keys you suspect have been compromised

### Installation Security

1. **Official Sources Only**: Only install LucidSelect from:
   - Chrome Web Store (recommended)
   - Official GitHub repository (developer mode)
2. **Verify Permissions**: Review the permissions requested by the extension
3. **Keep Updated**: Always use the latest version for security patches

### Data Privacy

LucidSelect:
- ✅ Stores API keys locally using Chrome's encrypted storage
- ✅ Does NOT send your API keys to any third-party servers
- ✅ Only sends selected text to the AI provider you choose
- ✅ Does NOT collect or transmit personal data
- ✅ Stores request history locally (not on external servers)

### What We Do NOT Access

- Your browsing history
- Data from other tabs or windows
- Passwords or payment information
- Personal files or documents
- Information from unselected text

## Known Security Considerations

### Chrome Storage
API keys are stored using `chrome.storage.sync` which:
- Encrypts data at rest
- Syncs across devices if Chrome sync is enabled
- Is only accessible by this extension

**Recommendation**: If you're concerned about syncing API keys across devices, we recommend:
1. Using different API keys per device, or
2. Disabling Chrome sync for extension data

### API Communication
All API requests are made over HTTPS to:
- `https://api.openai.com`
- `https://api.anthropic.com`
- `https://generativelanguage.googleapis.com`
- `https://api.together.xyz`

### Third-Party Dependencies
We regularly audit our dependencies for known vulnerabilities using:
- `npm audit`
- GitHub Dependabot alerts

## Security Updates

Security patches will be released as soon as possible after verification. Users will be notified through:
- Chrome Web Store automatic updates
- GitHub Security Advisories
- Project README

## Scope

The following are considered **out of scope** for security reports:

- Issues requiring physical access to a user's device
- Social engineering attacks
- Denial of service attacks
- Issues in third-party APIs (OpenAI, Anthropic, Google, Together.ai)
- Browser vulnerabilities

## Bug Bounty

We currently do not offer a bug bounty program, but we greatly appreciate security researchers who responsibly disclose vulnerabilities. We will publicly credit researchers who report valid security issues (unless they prefer to remain anonymous).

## Contact

For security concerns, contact the maintainers through:
- GitHub repository (private security advisory)
- Email: [Add your security email here]

---

Thank you for helping keep LucidSelect and its users safe! 🔐
