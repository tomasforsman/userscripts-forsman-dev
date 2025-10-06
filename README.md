# Userscripts Collection

A curated collection of userscripts for various purposes including GitHub automation, productivity tools, and general web enhancements.

## 📚 Table of Contents

- [What are Userscripts?](#what-are-userscripts)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## 🤔 What are Userscripts?

Userscripts are small JavaScript programs that modify the appearance or behavior of web pages. They run in your browser using a userscript manager extension and can automate tasks, add new features, or customize websites to your preferences.

## 🚀 Installation

### Prerequisites

Before you can use these userscripts, you need to install a userscript manager extension:

- **Chrome/Edge/Brave**: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
- **Firefox**: [Greasemonkey](https://www.greasespot.net/) or [Tampermonkey](https://www.tampermonkey.net/)
- **Safari**: [Userscripts](https://github.com/quoid/userscripts)

### Installing a Script

1. Click on the script file you want to install from the [scripts/](#available-scripts) directory
2. Click the "Raw" button to view the raw script file
3. Your userscript manager should automatically detect the script and prompt you to install it
4. Click "Install" or "Confirm installation"

Alternatively, you can manually copy the script content and create a new script in your userscript manager.

## 📦 Available Scripts

### GitHub Scripts
Scripts that enhance GitHub functionality.

- **[GitHub Issue Counter](scripts/github/github-issue-counter.user.js)** - Displays a count of open issues in repository navigation

### Productivity Scripts
Scripts that improve productivity across various websites.

- *Coming soon*

### General Scripts
General-purpose scripts for common web interactions.

- **[Universal Settings Manager](scripts/general/settings-manager.user.js)** - Centralized settings interface for managing userscript configurations
  - Provides a unified UI for configuring multiple userscripts
  - Supports 6 control types: boolean, string, text, number, enum, and array-string
  - Real-time validation with visual feedback
  - Persistent storage via GM storage
  - Keyboard shortcut: `Alt+Shift+S`
- **[Settings Manager Test](scripts/general/settings-manager-test.user.js)** - Example test script demonstrating how to use the Universal Settings Manager

## 📖 Usage

Each script includes:
- **Description**: What the script does
- **Match patterns**: Which websites the script runs on
- **Features**: Key functionality provided
- **Configuration**: Any available customization options

Refer to the comments at the top of each script file for detailed usage instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit new scripts or improvements.

### Quick Start for Contributors

1. Fork this repository
2. Create a new branch for your script
3. Use the [script template](templates/userscript-template.user.js) to create your script
4. Add documentation for your script
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Greasy Fork](https://greasyfork.org/) - Popular userscript repository
- [OpenUserJS](https://openuserjs.org/) - Another userscript repository
- [Tampermonkey Documentation](https://www.tampermonkey.net/documentation.php)
- [Userscript Metadata Block](https://wiki.greasespot.net/Metadata_Block)
