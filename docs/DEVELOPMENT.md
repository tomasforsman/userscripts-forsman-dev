# Development Guide

A comprehensive guide for developing userscripts for this collection.

## Table of Contents

- [Getting Started](#getting-started)
- [Userscript Basics](#userscript-basics)
- [Metadata Block](#metadata-block)
- [Development Environment](#development-environment)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Common Patterns](#common-patterns)
- [API Reference](#api-reference)

## Getting Started

### Prerequisites

- Basic knowledge of JavaScript
- A text editor or IDE (VS Code, Sublime Text, etc.)
- A userscript manager installed in your browser
- Browser Developer Tools knowledge (F12)

### Setting Up Your Environment

1. **Choose your text editor**: VS Code is recommended with these extensions:
   - ESLint
   - Prettier
   - JavaScript (ES6) code snippets

2. **Install a userscript manager** (see [INSTALLATION.md](INSTALLATION.md))

3. **Clone this repository** for reference and templates:
   ```bash
   git clone https://github.com/tomasforsman/userscripts-forsman-dev.git
   ```

## Userscript Basics

### What is a Userscript?

A userscript is a JavaScript file that runs in your browser to modify web pages. It consists of:

1. **Metadata block** - Configuration and information
2. **Code** - Your JavaScript logic

### Basic Structure

```javascript
// ==UserScript==
// @name         My First Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Does something cool
// @author       You
// @match        https://example.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Your code here
})();
```

## Metadata Block

The metadata block contains important information about your script:

### Essential Metadata

```javascript
// ==UserScript==
// @name         Script Name
// Required: The name of your script

// @namespace    http://tampermonkey.net/
// Optional but recommended: Helps avoid naming conflicts

// @version      1.0.0
// Required: Version number (use semantic versioning)

// @description  Brief description
// Required: What your script does

// @author       Your Name
// Optional: Script author

// @match        https://example.com/*
// Required: URL patterns where the script runs

// @grant        none
// Required: API permissions needed
// ==/UserScript==
```

### Advanced Metadata

```javascript
// ==UserScript==
// Icon for the script
// @icon         https://www.example.com/favicon.ico

// When to inject the script
// @run-at       document-start|document-end|document-idle

// Include additional scripts
// @require      https://code.jquery.com/jquery-3.6.0.min.js

// Where to check for updates
// @updateURL    https://example.com/script.meta.js
// @downloadURL  https://example.com/script.user.js

// License information
// @license      MIT

// Homepage
// @homepage     https://github.com/yourusername/yourscript

// Support URL
// @supportURL   https://github.com/yourusername/yourscript/issues
// ==/UserScript==
```

### @match vs @include

```javascript
// @match is more restrictive and recommended
// @match        https://example.com/*
// @match        https://*.example.com/*
// @match        *://example.com/*

// @include is more flexible but less secure
// @include      https://example.com/*
// @include      /https://.*\.example\.com/.*/
```

### @grant Permissions

```javascript
// No special permissions
// @grant        none

// Access to GM API functions
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_openInTab
```

## Development Environment

### Live Development

For rapid development, you can:

1. **Edit in userscript manager**:
   - Changes take effect on page reload
   - Use console.log for debugging

2. **Use a local file**:
   ```javascript
   // @require      file:///path/to/your/script.js
   ```

3. **Set up auto-reload**:
   - Some userscript managers support file monitoring
   - Tampermonkey: Enable "Track local file before this script"

### Debugging

```javascript
// Enable debug mode
const DEBUG = true;

function debug(...args) {
    if (DEBUG) {
        console.log('[MyScript]', ...args);
    }
}

debug('Script started');
debug('Variable value:', someVar);
```

Use browser Developer Tools (F12):
- **Console**: View logs and errors
- **Sources**: Set breakpoints in your code
- **Network**: Monitor requests
- **Elements**: Inspect DOM changes

## Best Practices

### Code Organization

```javascript
(function() {
    'use strict';

    // 1. Configuration at the top
    const CONFIG = {
        setting1: true,
        setting2: 'value'
    };

    // 2. Utility functions
    function utilityFunction() {
        // ...
    }

    // 3. Main functionality
    function mainFeature() {
        // ...
    }

    // 4. Initialization
    function init() {
        mainFeature();
    }

    // 5. Entry point
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
```

### Performance Tips

1. **Use event delegation** instead of multiple listeners:
```javascript
// Good
document.body.addEventListener('click', function(e) {
    if (e.target.matches('.my-button')) {
        handleClick(e.target);
    }
});

// Bad
document.querySelectorAll('.my-button').forEach(btn => {
    btn.addEventListener('click', handleClick);
});
```

2. **Debounce expensive operations**:
```javascript
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

window.addEventListener('resize', debounce(handleResize, 250));
```

3. **Use MutationObserver wisely**:
```javascript
const observer = new MutationObserver(mutations => {
    // Process mutations efficiently
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
```

### Security Considerations

1. **Sanitize user input**:
```javascript
// Never do this
element.innerHTML = userInput;

// Do this instead
element.textContent = userInput;
// Or use DOMPurify for HTML
```

2. **Be careful with @grant permissions**:
   - Only request permissions you actually need
   - Document why each permission is required

3. **Validate external data**:
```javascript
// Check API responses
fetch(url)
    .then(r => r.json())
    .then(data => {
        if (data && typeof data.value === 'string') {
            // Safe to use
        }
    });
```

## Testing

### Manual Testing Checklist

- [ ] Script loads without errors
- [ ] Functionality works as expected
- [ ] No console errors or warnings
- [ ] Works on different pages matching @match pattern
- [ ] Doesn't break page functionality
- [ ] Performance is acceptable
- [ ] Works after page navigation (SPA testing)

### Browser Testing

Test on multiple browsers:
- Chrome/Chromium
- Firefox
- Edge
- Safari (if applicable)

### Common Test Scenarios

```javascript
// Test with different DOM states
function testDOMReady() {
    console.assert(document.body, 'Body should exist');
    console.assert(document.getElementById('target'), 'Target should exist');
}

// Test error handling
function testErrorHandling() {
    try {
        // Code that might fail
        riskyOperation();
    } catch (e) {
        console.error('Handled error:', e);
        return false;
    }
    return true;
}
```

## Common Patterns

### Waiting for Elements

```javascript
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for ${selector}`));
        }, timeout);
    });
}

// Usage
waitForElement('.my-element').then(el => {
    console.log('Element found:', el);
});
```

### Persistent Storage

```javascript
// Using GM storage (requires @grant GM_getValue and GM_setValue)
function saveData(key, value) {
    GM_setValue(key, JSON.stringify(value));
}

function loadData(key, defaultValue) {
    const data = GM_getValue(key);
    return data ? JSON.parse(data) : defaultValue;
}

// Using localStorage (no @grant needed)
function saveDataLocal(key, value) {
    localStorage.setItem('myScript_' + key, JSON.stringify(value));
}

function loadDataLocal(key, defaultValue) {
    const data = localStorage.getItem('myScript_' + key);
    return data ? JSON.parse(data) : defaultValue;
}
```

### Making HTTP Requests

```javascript
// Using GM_xmlhttpRequest (works across origins)
// Requires @grant GM_xmlhttpRequest
function fetchData(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: response => resolve(response.responseText),
            onerror: error => reject(error)
        });
    });
}

// Using fetch (same-origin only, no @grant needed)
async function fetchDataLocal(url) {
    const response = await fetch(url);
    return await response.json();
}
```

### Creating UI Elements

```javascript
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    button.addEventListener('click', onClick);
    return button;
}

// Usage
const btn = createButton('Click Me', () => {
    console.log('Button clicked!');
});
document.body.appendChild(btn);
```

### Handling SPA Navigation

```javascript
// For Single Page Applications (React, Vue, etc.)
let currentUrl = location.href;

function onUrlChange() {
    console.log('URL changed to:', location.href);
    // Re-initialize your script
    init();
}

// Monitor URL changes
const observer = new MutationObserver(() => {
    if (location.href !== currentUrl) {
        currentUrl = location.href;
        onUrlChange();
    }
});

observer.observe(document, {
    subtree: true,
    childList: true
});

// Also listen to history events
window.addEventListener('popstate', onUrlChange);
```

## API Reference

### Userscript Manager APIs

Different userscript managers provide various APIs:

#### GM Functions (Tampermonkey, Greasemonkey)

```javascript
// Storage
GM_getValue(key, defaultValue)
GM_setValue(key, value)
GM_deleteValue(key)
GM_listValues()

// HTTP
GM_xmlhttpRequest({
    method: 'GET|POST|...',
    url: 'https://...',
    headers: {},
    data: '',
    onload: function(response) {},
    onerror: function(error) {}
})

// Notifications
GM_notification({
    text: 'Message',
    title: 'Title',
    onclick: function() {}
})

// Clipboard
GM_setClipboard(text, type)

// Other
GM_openInTab(url, options)
GM_addStyle(css)
```

### DOM Manipulation

```javascript
// Query elements
document.querySelector('.class')
document.querySelectorAll('.class')
document.getElementById('id')

// Create elements
const div = document.createElement('div')
div.className = 'my-class'
div.textContent = 'Content'
div.innerHTML = '<span>HTML</span>'

// Modify elements
element.classList.add('class')
element.classList.remove('class')
element.classList.toggle('class')
element.style.cssText = 'color: red;'
element.setAttribute('data-attr', 'value')

// Insert elements
parent.appendChild(element)
parent.insertBefore(element, reference)
element.insertAdjacentHTML('beforeend', html)
```

## Additional Resources

- [Tampermonkey Documentation](https://www.tampermonkey.net/documentation.php)
- [Greasemonkey Manual](https://wiki.greasespot.net/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [Greasy Fork](https://greasyfork.org/) - For inspiration and examples

## Getting Help

- Check the [Contributing Guidelines](../CONTRIBUTING.md)
- Open an issue in this repository
- Review existing userscripts for examples
- Consult the userscript manager documentation

Happy scripting! 🚀
