# Universal Settings Manager

A centralized settings interface for managing configuration of multiple Tampermonkey userscripts.

## Overview

The Universal Settings Manager provides a unified UI for configuring multiple userscripts. Instead of editing source code or managing separate configuration systems, this manager offers a single, consistent interface with:

- **6 control types** for different data types
- **Real-time validation** with visual feedback
- **Persistent storage** via Tampermonkey's GM storage
- **Shadow DOM isolation** to prevent conflicts
- **Keyboard shortcuts** for quick access

## Features

### Control Types

| Type | Description | Use Case |
|------|-------------|----------|
| `boolean` | Toggle switch | Enable/disable features |
| `string` | Text input | URLs, usernames, short text |
| `text` | Textarea | Long text, descriptions |
| `number` | Number input with optional slider | Counts, timeouts, percentages |
| `enum` | Dropdown select | Predefined options |
| `array-string` | Tag input | Lists of keywords, tags |

### Validation Rules

- `required` - Field must have a value
- `min` / `max` - Numeric range constraints
- `minLength` / `maxLength` - String/array length constraints
- `pattern` - RegEx pattern matching

### User Interface

- **Modal overlay** with dark theme
- **Two-column layout**: Script list + settings panel
- **Search functionality** to filter scripts
- **Status indicators**: Saved, unsaved changes, validation errors
- **Help tooltips** for each setting
- **Keyboard shortcuts**:
  - `Alt+Shift+S` - Open/close modal
  - `Escape` - Close modal
  - `Tab` - Navigate controls

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click on `settings-manager.user.js` in this repository
3. Click "Raw" button
4. Tampermonkey will detect and prompt to install
5. Confirm installation

## Usage

### For Users

1. Install the Settings Manager userscript
2. Install other compatible userscripts
3. Open Settings Manager:
   - Press `Alt+Shift+S`, or
   - Click Tampermonkey icon → "Open Settings Manager"
4. Select a script from the sidebar
5. Edit settings in the main panel
6. Click "Save" to apply changes
7. Click "Reset" to restore defaults

### For Developers

#### Basic Registration

```javascript
// Wait for Settings Manager to be available
if (window.SettingsManager) {
    window.SettingsManager.register({
        id: 'com.example.myscript',        // Unique identifier (reverse domain style)
        name: 'My Script',                  // Display name
        version: '1.0.0',                   // Semantic version
        description: 'Optional description', // Shown in header
        settings: [
            {
                key: 'enabled',             // Storage key
                type: 'boolean',            // Control type
                label: 'Enable Script',     // Field label
                description: 'Help text',   // Tooltip content
                default: true               // Default value
            }
        ]
    });
}
```

#### Complete Example

```javascript
// ==UserScript==
// @name         My Userscript
// @match        https://example.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    // Wait for Settings Manager
    function waitForSettingsManager() {
        return new Promise((resolve) => {
            if (window.SettingsManager) {
                resolve();
            } else {
                const interval = setInterval(() => {
                    if (window.SettingsManager) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    waitForSettingsManager().then(() => {
        // Register settings
        window.SettingsManager.register({
            id: 'com.example.myscript',
            name: 'My Script',
            version: '1.0.0',
            settings: [
                {
                    key: 'apiUrl',
                    type: 'string',
                    label: 'API URL',
                    description: 'Must be HTTPS',
                    default: 'https://api.example.com',
                    validation: {
                        required: true,
                        pattern: '^https://'
                    }
                },
                {
                    key: 'timeout',
                    type: 'number',
                    label: 'Timeout (seconds)',
                    default: 30,
                    validation: {
                        min: 5,
                        max: 300
                    }
                },
                {
                    key: 'mode',
                    type: 'enum',
                    label: 'Mode',
                    options: [
                        { value: 'auto', label: 'Automatic' },
                        { value: 'manual', label: 'Manual' }
                    ],
                    default: 'auto'
                },
                {
                    key: 'tags',
                    type: 'array-string',
                    label: 'Tags',
                    default: ['example']
                }
            ]
        });

        // Get current settings
        const settings = window.SettingsManager.getSettings('com.example.myscript');
        
        // Apply settings
        applySettings(settings);

        // Listen for changes
        window.SettingsManager.onChange('com.example.myscript', (newSettings) => {
            console.log('Settings updated:', newSettings);
            applySettings(newSettings);
        });
    });

    function applySettings(settings) {
        // Use settings in your script
        if (settings.enabled) {
            // Run script logic
        }
    }
})();
```

## API Reference

### `SettingsManager.register(schema)`

Register a script's settings schema.

**Parameters:**
- `schema` (Object): Settings schema object

**Schema Structure:**
```javascript
{
    id: string,              // Required: unique identifier
    name: string,            // Required: display name
    version: string,         // Required: semantic version
    description?: string,    // Optional: description text
    settings: [              // Required: array of settings
        {
            key: string,     // Required: storage key
            type: string,    // Required: control type
            label: string,   // Required: field label
            description?: string,    // Optional: help text
            default: any,    // Required: default value
            validation?: {   // Optional: validation rules
                required?: boolean,
                min?: number,
                max?: number,
                minLength?: number,
                maxLength?: number,
                pattern?: string
            },
            options?: [      // Required for 'enum' type
                {
                    value: string,
                    label: string
                }
            ]
        }
    ]
}
```

**Returns:** `boolean` - Success status

**Example:**
```javascript
const success = window.SettingsManager.register({
    id: 'test.script',
    name: 'Test Script',
    version: '1.0.0',
    settings: [/* ... */]
});
```

### `SettingsManager.getSettings(scriptId)`

Get current settings for a script.

**Parameters:**
- `scriptId` (string): Script identifier

**Returns:** `Object` - Settings object with keys from schema

**Example:**
```javascript
const settings = window.SettingsManager.getSettings('test.script');
console.log(settings.enabled); // true/false
```

### `SettingsManager.onChange(scriptId, callback)`

Subscribe to settings changes.

**Parameters:**
- `scriptId` (string): Script identifier
- `callback` (Function): Called when settings change

**Callback Parameters:**
- `settings` (Object): New settings object

**Example:**
```javascript
window.SettingsManager.onChange('test.script', (settings) => {
    console.log('New settings:', settings);
    applySettings(settings);
});
```

## Storage Format

Settings are stored using GM_setValue with namespaced keys:

```
usm_{scriptId}_{settingKey}
```

**Example:**
```
usm_test.script_enabled = "true"
usm_test.script_apiUrl = "\"https://example.com\""
usm_test.script_tags = "[\"tag1\",\"tag2\"]"
```

Values are JSON-encoded for consistent serialization.

## Events

### `usm-settings-changed`

Dispatched when settings are saved.

**Event Detail:**
```javascript
{
    scriptId: string,    // Script identifier
    settings: Object     // Complete settings object
}
```

**Example:**
```javascript
window.addEventListener('usm-settings-changed', (e) => {
    if (e.detail.scriptId === 'test.script') {
        console.log('Settings changed:', e.detail.settings);
    }
});
```

## Validation

Validation occurs in real-time (debounced 300ms) as users type. Invalid fields show:

- Red 2px border
- Error message below field
- Disabled Save button

### Validation Rules

**Required:**
```javascript
validation: { required: true }
```

**String Length:**
```javascript
validation: {
    minLength: 3,
    maxLength: 20
}
```

**Pattern Matching:**
```javascript
validation: {
    pattern: '^https://'  // RegEx pattern
}
```

**Numeric Range:**
```javascript
validation: {
    min: 0,
    max: 100
}
```

**Array Length:**
```javascript
validation: {
    minLength: 1,   // Minimum items
    maxLength: 10   // Maximum items
}
```

## Error Handling

### Invalid Schema

If a schema is invalid, the manager will:
1. Log error to console
2. Reject registration
3. Continue functioning for other scripts

**Common Issues:**
- Missing required fields (`id`, `name`, `version`, `settings`)
- Invalid setting type
- Missing `default` value
- Missing `options` for `enum` type

### Script ID Collision

If two scripts register with the same ID:
1. Last registered wins
2. Warning logged to console

### Corrupt Storage

If stored data is invalid:
1. Falls back to schema defaults
2. Error logged to console
3. User can save corrected values

## Browser Compatibility

- **Chrome/Chromium**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Edge**: ✅ Fully supported
- **Safari**: ⚠️ Requires Userscripts extension

## Technical Details

### Shadow DOM

The manager uses Shadow DOM (mode: 'open') for complete CSS isolation. This prevents:
- Page styles affecting the manager
- Manager styles affecting the page
- Class name conflicts

### Performance

- Debounced validation (300ms)
- Event delegation for dynamic elements
- Efficient storage operations
- No impact on page load time

### Security

- All user input is escaped
- No `eval()` or `innerHTML` with user data
- Content Security Policy compatible
- Validates all registered schemas

## Troubleshooting

### Modal won't open

1. Check console for errors
2. Verify Settings Manager is installed
3. Try Tampermonkey menu command
4. Reload page

### Script not appearing

1. Verify registration happens after Settings Manager loads
2. Check console for validation errors
3. Ensure schema is valid
4. Check script ID isn't duplicated

### Settings not persisting

1. Check `@grant GM_setValue` in your script
2. Verify settings were saved (not just edited)
3. Check browser storage limits
4. Look for GM storage errors in console

### Validation errors

1. Check validation rules match data type
2. Verify default values are valid
3. Test patterns with online RegEx tool
4. Review console for specific errors

## Examples

See `settings-manager-test.user.js` for a comprehensive example demonstrating:
- All control types
- Various validation rules
- Best practices for registration
- Listening to settings changes

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please:
1. Follow existing code style
2. Test thoroughly
3. Update documentation
4. Submit PR with description

## Support

- Open an issue for bugs
- Check existing issues first
- Include console errors
- Describe steps to reproduce
