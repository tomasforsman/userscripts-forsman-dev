// ==UserScript==
// @name         Universal Settings Manager
// @namespace    tampermonkey.settings
// @version      1.0.0
// @description  Centralized settings interface for userscripts
// @author       Forsman Dev
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @noframes
// @license      MIT
// ==/UserScript==

/**
 * Universal Settings Manager
 * 
 * A centralized settings interface for managing configuration of multiple userscripts.
 * Other userscripts can register their settings schemas and this manager provides
 * a unified UI for editing them.
 * 
 * Features:
 * - Modal interface with dark theme and shadow DOM isolation
 * - Support for 6 control types: boolean, string, text, number, enum, array-string
 * - Real-time validation with visual feedback
 * - Persistent storage via GM_setValue
 * - Change broadcasting via CustomEvent
 * - Keyboard shortcuts (Alt+Shift+S to open, Escape to close)
 * - Search functionality to filter scripts
 * 
 * API:
 * - window.SettingsManager.register(schema) - Register a script's config
 * - window.SettingsManager.getSettings(scriptId) - Get current settings
 * - window.SettingsManager.onChange(scriptId, callback) - Subscribe to changes
 */

(function() {
    'use strict';

    // ==================== Storage Wrapper ====================
    
    const Storage = {
        get: (scriptId, key) => {
            const storageKey = `usm_${scriptId}_${key}`;
            const val = GM_getValue(storageKey);
            return val !== undefined ? JSON.parse(val) : undefined;
        },
        
        set: (scriptId, key, value) => {
            const storageKey = `usm_${scriptId}_${key}`;
            GM_setValue(storageKey, JSON.stringify(value));
        },
        
        getAll: (scriptId) => {
            const prefix = `usm_${scriptId}_`;
            const allKeys = GM_listValues();
            return allKeys
                .filter(k => k.startsWith(prefix))
                .reduce((acc, k) => {
                    const settingKey = k.replace(prefix, '');
                    acc[settingKey] = JSON.parse(GM_getValue(k));
                    return acc;
                }, {});
        },
        
        deleteAll: (scriptId) => {
            const prefix = `usm_${scriptId}_`;
            const allKeys = GM_listValues();
            allKeys
                .filter(k => k.startsWith(prefix))
                .forEach(k => GM_deleteValue(k));
        }
    };

    // ==================== State ====================
    
    const state = {
        registeredScripts: [],
        currentScriptId: null,
        shadowRoot: null,
        isOpen: false,
        unsavedChanges: false,
        validationErrors: {}
    };

    // ==================== CSS Styles ====================
    
    const styles = `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        #usm-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 2147483647;
            display: none;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        #usm-backdrop.open {
            display: flex;
        }

        #usm-modal {
            background: #1e1e1e;
            color: #e0e0e0;
            border-radius: 8px;
            width: 90%;
            max-width: 1200px;
            height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        #usm-modal header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #333;
        }

        #usm-modal h1 {
            font-size: 20px;
            font-weight: 600;
        }

        #usm-close {
            background: transparent;
            border: none;
            color: #e0e0e0;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 200ms ease;
        }

        #usm-close:hover {
            background: #333;
        }

        #usm-close:focus {
            outline: 2px solid #0078d4;
            outline-offset: 2px;
        }

        #usm-body {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        #usm-sidebar {
            width: 280px;
            border-right: 1px solid #333;
            display: flex;
            flex-direction: column;
            background: #252525;
        }

        #usm-search {
            margin: 16px;
            padding: 10px 12px;
            background: #1e1e1e;
            border: 1px solid #444;
            border-radius: 4px;
            color: #e0e0e0;
            font-size: 14px;
        }

        #usm-search:focus {
            outline: 2px solid #0078d4;
            outline-offset: 0;
        }

        #usm-search::placeholder {
            color: #888;
        }

        #usm-script-list {
            list-style: none;
            overflow-y: auto;
            flex: 1;
        }

        .script-item {
            padding: 12px 16px;
            cursor: pointer;
            border-left: 3px solid transparent;
            transition: background 200ms ease;
        }

        .script-item:hover {
            background: #2d2d2d;
        }

        .script-item.active {
            background: #2d2d2d;
            border-left-color: #0078d4;
        }

        .script-item:focus {
            outline: 2px solid #0078d4;
            outline-offset: -2px;
        }

        .script-name {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .script-status {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4caf50;
        }

        .script-version {
            font-size: 12px;
            color: #888;
        }

        #usm-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        #usm-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
        }

        .no-scripts {
            text-align: center;
            padding: 48px 24px;
            color: #888;
        }

        .script-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #333;
        }

        .script-header h2 {
            font-size: 18px;
            margin-bottom: 4px;
        }

        .script-header .version {
            font-size: 14px;
            color: #888;
        }

        .field {
            margin-bottom: 24px;
        }

        .field label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        .help {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            margin-left: 6px;
            background: #444;
            border-radius: 50%;
            font-size: 11px;
            cursor: help;
            position: relative;
        }

        .help:hover::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #2d2d2d;
            color: #e0e0e0;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: normal;
            max-width: 280px;
            width: max-content;
            margin-bottom: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        }

        /* Toggle Switch */
        .toggle {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }

        .toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
            background: #444;
            border-radius: 24px;
            transition: background 200ms ease;
        }

        .slider::before {
            content: '';
            position: absolute;
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background: white;
            border-radius: 50%;
            transition: transform 200ms ease;
        }

        .toggle input:checked + .slider {
            background: #0078d4;
        }

        .toggle input:checked + .slider::before {
            transform: translateX(20px);
        }

        .toggle input:focus + .slider {
            outline: 2px solid #0078d4;
            outline-offset: 2px;
        }

        /* Text Inputs */
        input[type="text"],
        input[type="number"],
        textarea,
        select {
            width: 100%;
            padding: 10px 12px;
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 4px;
            color: #e0e0e0;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 200ms ease;
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        textarea:focus,
        select:focus {
            outline: none;
            border-color: #0078d4;
        }

        input[type="text"].error,
        input[type="number"].error,
        textarea.error,
        select.error {
            border-color: #f44336;
            border-width: 2px;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        .char-counter {
            font-size: 12px;
            color: #888;
            margin-top: 4px;
        }

        /* Number Input with Slider */
        .number-with-slider {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .number-with-slider input[type="number"] {
            width: 100px;
        }

        .number-with-slider input[type="range"] {
            flex: 1;
        }

        input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            background: #444;
            border-radius: 3px;
            outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #0078d4;
            border-radius: 50%;
            cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #0078d4;
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }

        input[type="range"]:focus::-webkit-slider-thumb {
            outline: 2px solid #0078d4;
            outline-offset: 2px;
        }

        input[type="range"]:focus::-moz-range-thumb {
            outline: 2px solid #0078d4;
            outline-offset: 2px;
        }

        /* Enum/Select */
        select {
            cursor: pointer;
        }

        select option {
            background: #2d2d2d;
            color: #e0e0e0;
        }

        /* Array String (Tags) */
        .tags-input-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 8px;
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 4px;
            min-height: 40px;
        }

        .tags-input-container.focused {
            border-color: #0078d4;
        }

        .tags-input-container.error {
            border-color: #f44336;
            border-width: 2px;
        }

        .tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: #444;
            border-radius: 4px;
            font-size: 13px;
        }

        .tag-remove {
            background: transparent;
            border: none;
            color: #e0e0e0;
            cursor: pointer;
            padding: 0;
            font-size: 16px;
            line-height: 1;
        }

        .tag-remove:hover {
            color: #f44336;
        }

        .tag-input {
            flex: 1;
            min-width: 120px;
            background: transparent;
            border: none;
            color: #e0e0e0;
            font-size: 14px;
            outline: none;
        }

        .tag-input::placeholder {
            color: #888;
        }

        /* Error Messages */
        .error-message {
            color: #f44336;
            font-size: 12px;
            margin-top: 4px;
        }

        /* Footer */
        #usm-panel footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 24px;
            border-top: 1px solid #333;
            background: #252525;
        }

        .status-indicator {
            font-size: 14px;
            color: #888;
        }

        .status-indicator.saved {
            color: #4caf50;
        }

        .status-indicator.unsaved {
            color: #ff9800;
        }

        .button-group {
            display: flex;
            gap: 12px;
        }

        button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 200ms ease;
        }

        button:focus {
            outline: 2px solid #0078d4;
            outline-offset: 2px;
        }

        #usm-reset {
            background: #444;
            color: #e0e0e0;
        }

        #usm-reset:hover {
            background: #555;
        }

        #usm-save {
            background: #0078d4;
            color: white;
        }

        #usm-save:hover {
            background: #005a9e;
        }

        #usm-save:disabled {
            background: #333;
            color: #666;
            cursor: not-allowed;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 12px;
        }

        ::-webkit-scrollbar-track {
            background: #1e1e1e;
        }

        ::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;

    // ==================== Validation ====================
    
    function validate(value, rules, type) {
        const errors = [];
        
        if (rules.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
            errors.push('Required');
            return errors;
        }
        
        if (value === undefined || value === null || value === '') {
            return errors;
        }
        
        if (type === 'string' || type === 'text') {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`Min ${rules.minLength} chars`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`Max ${rules.maxLength} chars`);
            }
            if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
                errors.push('Invalid format');
            }
        }
        
        if (type === 'number') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                errors.push('Must be a number');
            } else {
                if (rules.min !== undefined && num < rules.min) {
                    errors.push(`Min: ${rules.min}`);
                }
                if (rules.max !== undefined && num > rules.max) {
                    errors.push(`Max: ${rules.max}`);
                }
            }
        }
        
        if (type === 'array-string' && Array.isArray(value)) {
            if (rules.minLength && value.length < rules.minLength) {
                errors.push(`Min ${rules.minLength} items`);
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`Max ${rules.maxLength} items`);
            }
        }
        
        return errors;
    }

    // ==================== Control Renderers ====================
    
    function renderBoolean(setting, value) {
        return `
            <div class="field">
                <label>
                    ${escapeHtml(setting.label)}
                    ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                </label>
                <label class="toggle">
                    <input type="checkbox" data-key="${escapeHtml(setting.key)}" ${value ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
    }
    
    function renderString(setting, value) {
        const val = value !== undefined ? value : '';
        return `
            <div class="field">
                <label>
                    ${escapeHtml(setting.label)}
                    ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                </label>
                <input type="text" 
                    data-key="${escapeHtml(setting.key)}" 
                    value="${escapeHtml(val)}"
                    ${setting.validation?.required ? 'required' : ''}>
                <div class="error-message" data-error="${escapeHtml(setting.key)}"></div>
            </div>
        `;
    }
    
    function renderText(setting, value) {
        const val = value !== undefined ? value : '';
        return `
            <div class="field">
                <label>
                    ${escapeHtml(setting.label)}
                    ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                </label>
                <textarea 
                    data-key="${escapeHtml(setting.key)}"
                    ${setting.validation?.required ? 'required' : ''}
                    ${setting.validation?.maxLength ? `maxlength="${setting.validation.maxLength}"` : ''}
                >${escapeHtml(val)}</textarea>
                ${setting.validation?.maxLength ? `<div class="char-counter"><span data-counter="${escapeHtml(setting.key)}">0</span> / ${setting.validation.maxLength}</div>` : ''}
                <div class="error-message" data-error="${escapeHtml(setting.key)}"></div>
            </div>
        `;
    }
    
    function renderNumber(setting, value) {
        const val = value !== undefined ? value : (setting.default !== undefined ? setting.default : '');
        const hasRange = setting.validation?.min !== undefined && setting.validation?.max !== undefined;
        
        if (hasRange) {
            return `
                <div class="field">
                    <label>
                        ${escapeHtml(setting.label)}
                        ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                    </label>
                    <div class="number-with-slider">
                        <input type="number" 
                            data-key="${escapeHtml(setting.key)}" 
                            value="${val}"
                            ${setting.validation?.min !== undefined ? `min="${setting.validation.min}"` : ''}
                            ${setting.validation?.max !== undefined ? `max="${setting.validation.max}"` : ''}
                            ${setting.validation?.required ? 'required' : ''}>
                        <input type="range" 
                            data-key-slider="${escapeHtml(setting.key)}"
                            value="${val}"
                            min="${setting.validation.min}"
                            max="${setting.validation.max}">
                    </div>
                    <div class="error-message" data-error="${escapeHtml(setting.key)}"></div>
                </div>
            `;
        } else {
            return `
                <div class="field">
                    <label>
                        ${escapeHtml(setting.label)}
                        ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                    </label>
                    <input type="number" 
                        data-key="${escapeHtml(setting.key)}" 
                        value="${val}"
                        ${setting.validation?.min !== undefined ? `min="${setting.validation.min}"` : ''}
                        ${setting.validation?.max !== undefined ? `max="${setting.validation.max}"` : ''}
                        ${setting.validation?.required ? 'required' : ''}>
                    <div class="error-message" data-error="${escapeHtml(setting.key)}"></div>
                </div>
            `;
        }
    }
    
    function renderEnum(setting, value) {
        const val = value !== undefined ? value : setting.default;
        return `
            <div class="field">
                <label>
                    ${escapeHtml(setting.label)}
                    ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                </label>
                <select data-key="${escapeHtml(setting.key)}" ${setting.validation?.required ? 'required' : ''}>
                    ${setting.options.map(opt => `
                        <option value="${escapeHtml(opt.value)}" ${opt.value === val ? 'selected' : ''}>
                            ${escapeHtml(opt.label)}
                        </option>
                    `).join('')}
                </select>
                <div class="error-message" data-error="${escapeHtml(setting.key)}"></div>
            </div>
        `;
    }
    
    function renderArrayString(setting, value) {
        const val = value !== undefined ? value : (setting.default || []);
        return `
            <div class="field">
                <label>
                    ${escapeHtml(setting.label)}
                    ${setting.description ? `<span class="help" title="${escapeHtml(setting.description)}">ⓘ</span>` : ''}
                </label>
                <div class="tags-input-container" data-key="${escapeHtml(setting.key)}">
                    ${val.map(tag => `
                        <span class="tag">
                            ${escapeHtml(tag)}
                            <button type="button" class="tag-remove" data-tag="${escapeHtml(tag)}">×</button>
                        </span>
                    `).join('')}
                    <input type="text" class="tag-input" placeholder="Type and press Enter...">
                </div>
                <div class="error-message" data-error="${escapeHtml(setting.key)}"></div>
            </div>
        `;
    }

    // ==================== Modal HTML ====================
    
    function createModal() {
        return `
            <div id="usm-backdrop">
                <div id="usm-modal" role="dialog" aria-modal="true">
                    <header>
                        <h1>Settings Manager</h1>
                        <button id="usm-close" aria-label="Close">✕</button>
                    </header>
                    <div id="usm-body">
                        <aside id="usm-sidebar">
                            <input id="usm-search" type="text" placeholder="Search scripts..." aria-label="Search scripts">
                            <ul id="usm-script-list" role="list"></ul>
                        </aside>
                        <main id="usm-panel">
                            <div id="usm-content"></div>
                            <footer>
                                <span class="status-indicator"></span>
                                <div class="button-group">
                                    <button id="usm-reset">Reset</button>
                                    <button id="usm-save">Save</button>
                                </div>
                            </footer>
                        </main>
                    </div>
                </div>
            </div>
        `;
    }

    // ==================== Helper Functions ====================
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==================== UI Functions ====================
    
    function renderScriptList(filter = '') {
        const scriptList = state.shadowRoot.querySelector('#usm-script-list');
        const lowerFilter = filter.toLowerCase();
        
        const filteredScripts = state.registeredScripts.filter(script => 
            script.name.toLowerCase().includes(lowerFilter) || 
            script.id.toLowerCase().includes(lowerFilter)
        );
        
        if (filteredScripts.length === 0) {
            scriptList.innerHTML = '<div class="no-scripts">No scripts found</div>';
            return;
        }
        
        scriptList.innerHTML = filteredScripts.map(script => `
            <li class="script-item" tabindex="0" data-script-id="${escapeHtml(script.id)}" role="button">
                <div class="script-name">
                    <span class="script-status"></span>
                    <span>${escapeHtml(script.name.length > 30 ? script.name.substring(0, 27) + '...' : script.name)}</span>
                </div>
                <div class="script-version">v${escapeHtml(script.version)}</div>
            </li>
        `).join('');
        
        // Add click handlers
        scriptList.querySelectorAll('.script-item').forEach(item => {
            item.addEventListener('click', () => {
                loadScript(item.dataset.scriptId);
            });
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadScript(item.dataset.scriptId);
                }
            });
        });
    }
    
    function loadScript(scriptId) {
        const script = state.registeredScripts.find(s => s.id === scriptId);
        if (!script) return;
        
        state.currentScriptId = scriptId;
        state.unsavedChanges = false;
        state.validationErrors = {};
        
        // Update active state in sidebar
        state.shadowRoot.querySelectorAll('.script-item').forEach(item => {
            item.classList.toggle('active', item.dataset.scriptId === scriptId);
        });
        
        renderScriptSettings(script);
        updateStatus();
    }
    
    function renderScriptSettings(script) {
        const content = state.shadowRoot.querySelector('#usm-content');
        
        const html = `
            <div class="script-header">
                <h2>${escapeHtml(script.name)}</h2>
                <div class="version">Version ${escapeHtml(script.version)}</div>
                ${script.description ? `<p style="margin-top: 8px; color: #888;">${escapeHtml(script.description)}</p>` : ''}
            </div>
            ${script.settings.map(setting => {
                const savedValue = Storage.get(script.id, setting.key);
                const value = savedValue !== undefined ? savedValue : setting.default;
                
                switch (setting.type) {
                    case 'boolean': return renderBoolean(setting, value);
                    case 'string': return renderString(setting, value);
                    case 'text': return renderText(setting, value);
                    case 'number': return renderNumber(setting, value);
                    case 'enum': return renderEnum(setting, value);
                    case 'array-string': return renderArrayString(setting, value);
                    default: return `<div class="field">Unknown type: ${setting.type}</div>`;
                }
            }).join('')}
        `;
        
        content.innerHTML = html;
        attachEventListeners();
        
        // Update character counters
        script.settings.forEach(setting => {
            if (setting.type === 'text' && setting.validation?.maxLength) {
                updateCharCounter(setting.key);
            }
        });
    }
    
    function attachEventListeners() {
        const content = state.shadowRoot.querySelector('#usm-content');
        
        // Text and number inputs
        content.querySelectorAll('input[data-key], textarea[data-key], select[data-key]').forEach(input => {
            const handler = debounce(() => {
                state.unsavedChanges = true;
                validateField(input.dataset.key);
                updateStatus();
            }, 300);
            
            input.addEventListener('input', handler);
            
            if (input.type === 'checkbox') {
                input.addEventListener('change', handler);
            }
            
            // Update char counter for textareas
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => updateCharCounter(input.dataset.key));
            }
        });
        
        // Number sliders
        content.querySelectorAll('input[data-key-slider]').forEach(slider => {
            slider.addEventListener('input', () => {
                const key = slider.dataset.keySlider;
                const numberInput = content.querySelector(`input[data-key="${key}"]`);
                numberInput.value = slider.value;
                state.unsavedChanges = true;
                validateField(key);
                updateStatus();
            });
        });
        
        // Sync number input with slider
        content.querySelectorAll('input[type="number"][data-key]').forEach(input => {
            const slider = content.querySelector(`input[data-key-slider="${input.dataset.key}"]`);
            if (slider) {
                input.addEventListener('input', () => {
                    slider.value = input.value;
                });
            }
        });
        
        // Tag inputs
        content.querySelectorAll('.tags-input-container').forEach(container => {
            const input = container.querySelector('.tag-input');
            
            container.addEventListener('click', () => {
                input.focus();
            });
            
            input.addEventListener('focus', () => {
                container.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                container.classList.remove('focused');
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag(container, input.value.trim());
                    input.value = '';
                } else if (e.key === 'Backspace' && input.value === '') {
                    const tags = container.querySelectorAll('.tag');
                    if (tags.length > 0) {
                        const lastTag = tags[tags.length - 1];
                        removeTag(container, lastTag.querySelector('.tag-remove').dataset.tag);
                    }
                }
            });
            
            container.querySelectorAll('.tag-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeTag(container, btn.dataset.tag);
                });
            });
        });
    }
    
    function addTag(container, value) {
        if (!value) return;
        
        const key = container.dataset.key;
        const tags = getTagsFromContainer(container);
        
        if (!tags.includes(value)) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${escapeHtml(value)}
                <button type="button" class="tag-remove" data-tag="${escapeHtml(value)}">×</button>
            `;
            
            const input = container.querySelector('.tag-input');
            container.insertBefore(tagElement, input);
            
            tagElement.querySelector('.tag-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                removeTag(container, value);
            });
            
            state.unsavedChanges = true;
            validateField(key);
            updateStatus();
        }
    }
    
    function removeTag(container, value) {
        const key = container.dataset.key;
        container.querySelectorAll('.tag').forEach(tag => {
            if (tag.querySelector('.tag-remove').dataset.tag === value) {
                tag.remove();
            }
        });
        
        state.unsavedChanges = true;
        validateField(key);
        updateStatus();
    }
    
    function getTagsFromContainer(container) {
        return Array.from(container.querySelectorAll('.tag-remove')).map(btn => btn.dataset.tag);
    }
    
    function updateCharCounter(key) {
        const textarea = state.shadowRoot.querySelector(`textarea[data-key="${key}"]`);
        const counter = state.shadowRoot.querySelector(`[data-counter="${key}"]`);
        if (textarea && counter) {
            counter.textContent = textarea.value.length;
        }
    }
    
    function validateField(key) {
        const script = state.registeredScripts.find(s => s.id === state.currentScriptId);
        if (!script) return;
        
        const setting = script.settings.find(s => s.key === key);
        if (!setting) return;
        
        let value;
        const content = state.shadowRoot.querySelector('#usm-content');
        
        if (setting.type === 'boolean') {
            const input = content.querySelector(`input[data-key="${key}"]`);
            value = input.checked;
        } else if (setting.type === 'array-string') {
            const container = content.querySelector(`.tags-input-container[data-key="${key}"]`);
            value = getTagsFromContainer(container);
        } else {
            const input = content.querySelector(`input[data-key="${key}"], textarea[data-key="${key}"], select[data-key="${key}"]`);
            value = input.value;
            if (setting.type === 'number') {
                value = parseFloat(value);
            }
        }
        
        const errors = validate(value, setting.validation || {}, setting.type);
        state.validationErrors[key] = errors;
        
        // Update UI
        const errorDiv = content.querySelector(`[data-error="${key}"]`);
        if (errorDiv) {
            errorDiv.textContent = errors.join(', ');
        }
        
        // Update input styling
        if (setting.type === 'array-string') {
            const container = content.querySelector(`.tags-input-container[data-key="${key}"]`);
            container.classList.toggle('error', errors.length > 0);
        } else if (setting.type !== 'boolean') {
            const input = content.querySelector(`input[data-key="${key}"], textarea[data-key="${key}"], select[data-key="${key}"]`);
            input.classList.toggle('error', errors.length > 0);
        }
        
        return errors.length === 0;
    }
    
    function updateStatus() {
        const statusIndicator = state.shadowRoot.querySelector('.status-indicator');
        const saveButton = state.shadowRoot.querySelector('#usm-save');
        
        const hasErrors = Object.values(state.validationErrors).some(errors => errors.length > 0);
        
        if (hasErrors) {
            statusIndicator.textContent = 'Validation errors';
            statusIndicator.className = 'status-indicator';
            saveButton.disabled = true;
        } else if (state.unsavedChanges) {
            statusIndicator.textContent = 'Unsaved changes';
            statusIndicator.className = 'status-indicator unsaved';
            saveButton.disabled = false;
        } else {
            statusIndicator.textContent = 'Saved';
            statusIndicator.className = 'status-indicator saved';
            saveButton.disabled = false;
        }
    }
    
    function handleSave() {
        const script = state.registeredScripts.find(s => s.id === state.currentScriptId);
        if (!script) return;
        
        const content = state.shadowRoot.querySelector('#usm-content');
        const settings = {};
        
        // Validate all fields first
        let allValid = true;
        script.settings.forEach(setting => {
            if (!validateField(setting.key)) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            return;
        }
        
        // Collect values
        script.settings.forEach(setting => {
            let value;
            
            if (setting.type === 'boolean') {
                const input = content.querySelector(`input[data-key="${setting.key}"]`);
                value = input.checked;
            } else if (setting.type === 'array-string') {
                const container = content.querySelector(`.tags-input-container[data-key="${setting.key}"]`);
                value = getTagsFromContainer(container);
            } else {
                const input = content.querySelector(`input[data-key="${setting.key}"], textarea[data-key="${setting.key}"], select[data-key="${setting.key}"]`);
                value = input.value;
                if (setting.type === 'number') {
                    value = parseFloat(value);
                }
            }
            
            settings[setting.key] = value;
            Storage.set(script.id, setting.key, value);
        });
        
        state.unsavedChanges = false;
        updateStatus();
        
        // Broadcast changes
        notifyScript(script.id, settings);
    }
    
    function handleReset() {
        const script = state.registeredScripts.find(s => s.id === state.currentScriptId);
        if (!script) return;
        
        // Clear stored values
        script.settings.forEach(setting => {
            const key = `usm_${script.id}_${setting.key}`;
            GM_deleteValue(key);
        });
        
        state.unsavedChanges = false;
        state.validationErrors = {};
        
        // Re-render with defaults
        renderScriptSettings(script);
        updateStatus();
        
        // Broadcast changes with defaults
        const settings = {};
        script.settings.forEach(setting => {
            settings[setting.key] = setting.default;
        });
        notifyScript(script.id, settings);
    }
    
    function notifyScript(scriptId, settings) {
        window.dispatchEvent(new CustomEvent('usm-settings-changed', {
            detail: { scriptId, settings }
        }));
    }

    // ==================== Modal Control ====================
    
    function openModal() {
        if (state.isOpen) return;
        
        const backdrop = state.shadowRoot.querySelector('#usm-backdrop');
        backdrop.classList.add('open');
        state.isOpen = true;
        
        // Focus the search input
        const searchInput = state.shadowRoot.querySelector('#usm-search');
        setTimeout(() => searchInput.focus(), 100);
    }
    
    function closeModal() {
        if (!state.isOpen) return;
        
        const backdrop = state.shadowRoot.querySelector('#usm-backdrop');
        backdrop.classList.remove('open');
        state.isOpen = false;
        state.currentScriptId = null;
    }
    
    function toggleModal() {
        if (state.isOpen) {
            closeModal();
        } else {
            openModal();
        }
    }

    // ==================== Public API ====================
    
    window.SettingsManager = {
        register: function(schema) {
            // Validate schema
            if (!schema.id || !schema.name || !schema.version || !schema.settings) {
                console.error('[Universal Settings Manager] Invalid schema: missing required fields', schema);
                return false;
            }
            
            if (!Array.isArray(schema.settings) || schema.settings.length === 0) {
                console.error('[Universal Settings Manager] Invalid schema: settings must be a non-empty array', schema);
                return false;
            }
            
            // Validate each setting
            for (const setting of schema.settings) {
                if (!setting.key || !setting.type || !setting.label || setting.default === undefined) {
                    console.error('[Universal Settings Manager] Invalid setting: missing required fields', setting);
                    return false;
                }
            }
            
            // Check for duplicate IDs
            const existing = state.registeredScripts.find(s => s.id === schema.id);
            if (existing) {
                console.warn('[Universal Settings Manager] Script ID collision - last registered wins:', schema.id);
                state.registeredScripts = state.registeredScripts.filter(s => s.id !== schema.id);
            }
            
            state.registeredScripts.push(schema);
            
            // Update UI if modal is initialized
            if (state.shadowRoot) {
                renderScriptList();
            }
            
            console.log('[Universal Settings Manager] Registered:', schema.name);
            return true;
        },
        
        getSettings: function(scriptId) {
            const script = state.registeredScripts.find(s => s.id === scriptId);
            if (!script) {
                console.error('[Universal Settings Manager] Script not found:', scriptId);
                return null;
            }
            
            const settings = {};
            script.settings.forEach(setting => {
                const saved = Storage.get(scriptId, setting.key);
                settings[setting.key] = saved !== undefined ? saved : setting.default;
            });
            
            return settings;
        },
        
        onChange: function(scriptId, callback) {
            window.addEventListener('usm-settings-changed', (e) => {
                if (e.detail.scriptId === scriptId) {
                    callback(e.detail.settings);
                }
            });
        }
    };

    // ==================== Initialization ====================
    
    function init() {
        // Create shadow DOM container
        const container = document.createElement('div');
        container.id = 'usm-root';
        document.body.appendChild(container);
        
        state.shadowRoot = container.attachShadow({ mode: 'open' });
        
        // Add styles
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        state.shadowRoot.appendChild(styleElement);
        
        // Add modal HTML
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = createModal();
        state.shadowRoot.appendChild(modalContainer);
        
        // Initial render
        renderScriptList();
        
        // Attach event listeners
        const closeBtn = state.shadowRoot.querySelector('#usm-close');
        closeBtn.addEventListener('click', closeModal);
        
        const backdrop = state.shadowRoot.querySelector('#usm-backdrop');
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal();
            }
        });
        
        const searchInput = state.shadowRoot.querySelector('#usm-search');
        searchInput.addEventListener('input', (e) => {
            renderScriptList(e.target.value);
        });
        
        const saveBtn = state.shadowRoot.querySelector('#usm-save');
        saveBtn.addEventListener('click', handleSave);
        
        const resetBtn = state.shadowRoot.querySelector('#usm-reset');
        resetBtn.addEventListener('click', handleReset);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt+Shift+S to toggle modal
            if (e.altKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                toggleModal();
            }
            
            // Escape to close
            if (e.key === 'Escape' && state.isOpen) {
                e.preventDefault();
                closeModal();
            }
        });
        
        // Register menu command
        GM_registerMenuCommand('Open Settings Manager', () => {
            toggleModal();
        });
        
        console.log('[Universal Settings Manager] Initialized');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
