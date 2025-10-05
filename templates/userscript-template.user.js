// ==UserScript==
// @name         Script Name Here
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Brief description of what this script does
// @author       Your Name
// @match        https://example.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=example.com
// @grant        none
// @license      MIT
// ==/UserScript==

/**
 * Userscript Template
 * 
 * Description:
 * Detailed description of what this script does and how it works.
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 * 
 * Usage:
 * 1. Step 1
 * 2. Step 2
 * 
 * Configuration:
 * You can customize the behavior by modifying the CONFIG object below.
 */

(function() {
    'use strict';

    // ==================== Configuration ====================
    const CONFIG = {
        // Add your configuration options here
        enabled: true,
        debugMode: false,
        // Add more options as needed
    };

    // ==================== Helper Functions ====================
    
    /**
     * Log debug messages if debug mode is enabled
     * @param {*} message - Message to log
     */
    function debug(message) {
        if (CONFIG.debugMode) {
            console.log('[Script Name]:', message);
        }
    }

    /**
     * Wait for an element to appear in the DOM
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element>}
     */
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                return resolve(element);
            }

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
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // ==================== Main Functionality ====================
    
    /**
     * Main function - entry point of the script
     */
    function main() {
        debug('Script initialized');

        if (!CONFIG.enabled) {
            debug('Script is disabled in configuration');
            return;
        }

        try {
            // Your main code here
            debug('Running main functionality');
            
            // Example: Wait for an element and do something with it
            // waitForElement('.some-class').then(element => {
            //     debug('Element found:', element);
            //     // Do something with the element
            // }).catch(error => {
            //     debug('Error:', error);
            // });

        } catch (error) {
            console.error('[Script Name] Error:', error);
        }
    }

    // ==================== Initialization ====================
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        // DOM is already ready
        main();
    }

    debug('Script loaded');

})();
