# General Userscripts

General-purpose scripts that work across multiple websites or provide common functionality.

## Available Scripts

### Universal Settings Manager
**File:** `settings-manager.user.js`

A centralized settings interface for managing configuration of multiple userscripts. Other userscripts can register their settings schemas and this manager provides a unified UI for editing them.

**Features:**
- Modal interface with dark theme and shadow DOM isolation
- Support for 6 control types: boolean, string, text, number, enum, array-string
- Real-time validation with visual feedback
- Persistent storage via GM storage
- Change broadcasting via CustomEvent
- Keyboard shortcuts (Alt+Shift+S to open, Escape to close)
- Search functionality to filter scripts

**Usage:**
1. Install the Settings Manager userscript
2. Press `Alt+Shift+S` or use Tampermonkey menu to open settings
3. Install other userscripts that register with the Settings Manager
4. Configure settings through the unified interface

**For Developers:**
```javascript
// Register your script's settings
window.SettingsManager.register({
    id: 'com.example.myscript',
    name: 'My Script',
    version: '1.0.0',
    settings: [
        {
            key: 'enabled',
            type: 'boolean',
            label: 'Enable Script',
            default: true
        }
        // ... more settings
    ]
});

// Get current settings
const settings = window.SettingsManager.getSettings('com.example.myscript');

// Listen for changes
window.SettingsManager.onChange('com.example.myscript', (settings) => {
    console.log('Settings updated:', settings);
});
```

### Settings Manager Test
**File:** `settings-manager-test.user.js`

A comprehensive test script demonstrating how to use the Universal Settings Manager. Shows examples of all control types and validation rules.

**Usage:**
1. Install both the Settings Manager and this test script
2. Open the Settings Manager (Alt+Shift+S)
3. You'll see "Test Script" in the sidebar
4. Click it to see all control types in action

## Planned Scripts

Ideas for general-purpose scripts:

- **Dark Mode Toggle** - Add dark mode to any website
- **Auto Scroll** - Automatic page scrolling with controls
- **Link Opener** - Open multiple links at once
- **Text Formatter** - Format and transform text on any page
- **Cookie Manager** - Manage cookies easily

## Contributing

Have a useful general script? Please contribute! See the [Contributing Guidelines](../../CONTRIBUTING.md) for details.
