# Contributing Guidelines

Thank you for considering contributing to this userscripts collection! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [How to Contribute](#how-to-contribute)
- [Script Guidelines](#script-guidelines)
- [Submission Process](#submission-process)
- [Code Standards](#code-standards)

## 🤝 How to Contribute

There are several ways you can contribute to this project:

1. **Submit new userscripts** - Share your useful scripts with the community
2. **Improve existing scripts** - Bug fixes, feature additions, or optimizations
3. **Documentation** - Improve README files, add usage examples, or fix typos
4. **Report issues** - Let us know about bugs or suggest new features

## 📝 Script Guidelines

### Before Submitting

- **Functionality**: Ensure your script works correctly and provides real value
- **Compatibility**: Test on multiple browsers if possible (Chrome, Firefox, Edge)
- **Uniqueness**: Check that a similar script doesn't already exist in the repository
- **License**: Ensure you have the right to share the code under MIT license

### Script Requirements

All submitted scripts must:

1. **Include proper metadata** using the userscript metadata block:
   ```javascript
   // ==UserScript==
   // @name         Script Name
   // @namespace    http://tampermonkey.net/
   // @version      1.0.0
   // @description  Clear description of what the script does
   // @author       Your Name
   // @match        https://example.com/*
   // @grant        none
   // ==/UserScript==
   ```

2. **Have clear documentation** including:
   - Purpose and functionality
   - Installation instructions
   - Usage examples
   - Any configuration options

3. **Follow naming conventions**:
   - Use descriptive names: `github-pr-enhancer.user.js`
   - Include `.user.js` extension
   - Use lowercase with hyphens

4. **Be well-organized**:
   - Place in appropriate category folder (scripts/github/, scripts/productivity/, etc.)
   - Include inline comments for complex logic
   - Use meaningful variable and function names

## 🚀 Submission Process

1. **Fork the repository** to your GitHub account

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/userscripts-forsman-dev.git
   cd userscripts-forsman-dev
   ```

3. **Create a new branch** for your contribution:
   ```bash
   git checkout -b add-my-script
   ```

4. **Add your script**:
   - Use the template from `templates/userscript-template.user.js`
   - Place it in the appropriate `scripts/` subdirectory
   - Create a README in the same directory if adding multiple related scripts

5. **Update documentation**:
   - Add your script to the "Available Scripts" section in main README.md
   - Include a brief description and key features

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add [script name] - brief description"
   ```

7. **Push to your fork**:
   ```bash
   git push origin add-my-script
   ```

8. **Create a Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Provide a clear description of your changes

## 💻 Code Standards

### JavaScript Best Practices

- Use modern JavaScript (ES6+) when possible
- Avoid global namespace pollution
- Handle errors gracefully
- Use `'use strict';` mode
- Comment complex logic

### Code Style

- Use 2 or 4 spaces for indentation (be consistent)
- Use meaningful variable names
- Keep functions small and focused
- Add comments for non-obvious code

### Example Structure

```javascript
// ==UserScript==
// @name         Example Script
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Example userscript structure
// @author       Your Name
// @match        https://example.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        option1: true,
        option2: 'value'
    };

    // Main functionality
    function main() {
        // Your code here
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
```

## 🐛 Reporting Issues

When reporting issues, please include:

- Script name and version
- Browser and userscript manager (e.g., Chrome with Tampermonkey)
- Steps to reproduce the issue
- Expected vs actual behavior
- Any error messages from browser console

## ✅ Review Process

All contributions will be reviewed for:

- Functionality and usefulness
- Code quality and standards
- Security concerns
- Documentation completeness

Reviews typically take 1-7 days. We may request changes before merging.

## 📜 Code of Conduct

- Be respectful and constructive
- Welcome newcomers and beginners
- Focus on the code, not the person
- Give credit where it's due

## 📞 Questions?

If you have questions about contributing, feel free to:
- Open an issue with the "question" label
- Start a discussion in the repository

Thank you for contributing! 🎉
