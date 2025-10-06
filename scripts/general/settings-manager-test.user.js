// ==UserScript==
// @name         Settings Manager Test
// @namespace    tampermonkey.settings.test
// @version      1.0.0
// @description  Test script for Universal Settings Manager
// @author       Forsman Dev
// @match        https://example.com/*
// @match        https://www.example.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @license      MIT
// ==/UserScript==

/**
 * Settings Manager Test Script
 * 
 * This script demonstrates how to use the Universal Settings Manager.
 * It registers a comprehensive set of test settings covering all control types.
 */

(function() {
    'use strict';

    // Wait for Settings Manager to be available
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

    // Initialize
    waitForSettingsManager().then(() => {
        console.log('[Test Script] Registering with Settings Manager...');

        // Register test settings
        window.SettingsManager.register({
            id: 'test.script',
            name: 'Test Script',
            version: '1.0.0',
            description: 'A comprehensive test script demonstrating all control types',
            settings: [
                {
                    key: 'enabled',
                    type: 'boolean',
                    label: 'Enable Script',
                    description: 'Toggle to enable or disable the test script',
                    default: true
                },
                {
                    key: 'apiUrl',
                    type: 'string',
                    label: 'API URL',
                    description: 'Must be a valid HTTPS URL',
                    default: '',
                    validation: {
                        required: true,
                        pattern: '^https://',
                        minLength: 10
                    }
                },
                {
                    key: 'username',
                    type: 'string',
                    label: 'Username',
                    description: 'Your username (3-20 characters)',
                    default: 'user',
                    validation: {
                        required: true,
                        minLength: 3,
                        maxLength: 20
                    }
                },
                {
                    key: 'description',
                    type: 'text',
                    label: 'Description',
                    description: 'A longer text field with character limit',
                    default: 'This is a test description.',
                    validation: {
                        maxLength: 500
                    }
                },
                {
                    key: 'count',
                    type: 'number',
                    label: 'Item Count',
                    description: 'Number of items to process (1-10)',
                    default: 5,
                    validation: {
                        required: true,
                        min: 1,
                        max: 10
                    }
                },
                {
                    key: 'timeout',
                    type: 'number',
                    label: 'Timeout (seconds)',
                    description: 'Request timeout duration',
                    default: 30,
                    validation: {
                        min: 5
                    }
                },
                {
                    key: 'mode',
                    type: 'enum',
                    label: 'Operation Mode',
                    description: 'Choose how the script operates',
                    options: [
                        { value: 'automatic', label: 'Automatic' },
                        { value: 'manual', label: 'Manual' },
                        { value: 'scheduled', label: 'Scheduled' }
                    ],
                    default: 'automatic',
                    validation: {
                        required: true
                    }
                },
                {
                    key: 'theme',
                    type: 'enum',
                    label: 'Theme',
                    description: 'UI theme preference',
                    options: [
                        { value: 'dark', label: 'Dark Theme' },
                        { value: 'light', label: 'Light Theme' },
                        { value: 'auto', label: 'Auto (System)' }
                    ],
                    default: 'dark'
                },
                {
                    key: 'tags',
                    type: 'array-string',
                    label: 'Filter Tags',
                    description: 'Add tags to filter content (press Enter or comma to add)',
                    default: ['test', 'example'],
                    validation: {
                        minLength: 1,
                        maxLength: 10
                    }
                },
                {
                    key: 'keywords',
                    type: 'array-string',
                    label: 'Keywords',
                    description: 'Keywords for search',
                    default: []
                }
            ]
        });

        // Listen for settings changes
        window.SettingsManager.onChange('test.script', (settings) => {
            console.log('[Test Script] Settings updated:', settings);
            
            // Apply settings
            applySettings(settings);
        });

        // Load initial settings
        const currentSettings = window.SettingsManager.getSettings('test.script');
        console.log('[Test Script] Current settings:', currentSettings);
        applySettings(currentSettings);
    });

    function applySettings(settings) {
        // This is where you would apply the settings to your script
        console.log('[Test Script] Applying settings...');
        
        if (settings.enabled) {
            console.log('[Test Script] Script is enabled');
            console.log('[Test Script] API URL:', settings.apiUrl);
            console.log('[Test Script] Username:', settings.username);
            console.log('[Test Script] Mode:', settings.mode);
            console.log('[Test Script] Theme:', settings.theme);
            console.log('[Test Script] Count:', settings.count);
            console.log('[Test Script] Timeout:', settings.timeout);
            console.log('[Test Script] Tags:', settings.tags);
            console.log('[Test Script] Keywords:', settings.keywords);
        } else {
            console.log('[Test Script] Script is disabled');
        }
    }

})();
