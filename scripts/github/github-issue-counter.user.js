// ==UserScript==
// @name         GitHub Issue Counter
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Displays a count of open issues in GitHub repository navigation
// @author       Tomas Forsman
// @match        https://github.com/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// @license      MIT
// ==/UserScript==

/**
 * GitHub Issue Counter
 * 
 * This script adds a visual counter badge next to the Issues tab in GitHub repositories,
 * showing the number of open issues at a glance without having to click into the Issues page.
 * 
 * Features:
 * - Shows open issue count on repository navigation
 * - Updates dynamically when navigating
 * - Minimal, non-intrusive design
 * - Works with GitHub's dark mode
 * 
 * Usage:
 * 1. Navigate to any GitHub repository
 * 2. The issue count will appear next to the Issues tab
 * 3. The badge updates when you navigate between repositories
 */

(function() {
    'use strict';

    // ==================== Configuration ====================
    const CONFIG = {
        enabled: true,
        debugMode: false,
        badgeColor: '#1f6feb',
        textColor: '#ffffff',
        updateInterval: 30000 // Update every 30 seconds if on the same page
    };

    // ==================== Helper Functions ====================
    
    /**
     * Log debug messages if debug mode is enabled
     */
    function debug(...args) {
        if (CONFIG.debugMode) {
            console.log('[GitHub Issue Counter]:', ...args);
        }
    }

    /**
     * Extract repository owner and name from URL
     * @returns {Object|null} Object with owner and repo, or null if not on a repo page
     */
    function getRepoInfo() {
        const match = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
        if (!match) return null;
        
        const [, owner, repo] = match;
        // Exclude user pages, settings, etc.
        if (['settings', 'new', 'organizations'].includes(owner)) return null;
        
        return { owner, repo };
    }

    /**
     * Fetch issue count from GitHub DOM
     * @returns {number|null} Number of open issues or null if not found
     */
    function getIssueCount() {
        // GitHub shows the issue count in the Issues tab counter
        const issuesLink = document.querySelector('[data-tab-item="issues-tab"]');
        if (!issuesLink) {
            debug('Issues tab not found');
            return null;
        }

        // Look for the counter element
        const counter = issuesLink.querySelector('.Counter');
        if (!counter) {
            debug('Counter element not found');
            return 0; // No counter usually means 0 issues
        }

        const count = parseInt(counter.textContent.trim(), 10);
        debug('Found issue count:', count);
        return isNaN(count) ? null : count;
    }

    /**
     * Create a badge element with the issue count
     * @param {number} count - Number of issues
     * @returns {HTMLElement} Badge element
     */
    function createBadge(count) {
        const badge = document.createElement('span');
        badge.className = 'userscript-issue-badge';
        badge.textContent = count;
        badge.style.cssText = `
            display: inline-block;
            padding: 2px 6px;
            margin-left: 6px;
            font-size: 11px;
            font-weight: 600;
            line-height: 1;
            color: ${CONFIG.textColor};
            background-color: ${CONFIG.badgeColor};
            border-radius: 20px;
            vertical-align: middle;
        `;
        return badge;
    }

    /**
     * Remove existing badge if present
     */
    function removeBadge() {
        const existingBadge = document.querySelector('.userscript-issue-badge');
        if (existingBadge) {
            existingBadge.remove();
            debug('Removed existing badge');
        }
    }

    /**
     * Add the issue count badge to the Issues tab
     */
    function addIssueBadge() {
        const repoInfo = getRepoInfo();
        if (!repoInfo) {
            debug('Not on a repository page');
            return;
        }

        const issuesLink = document.querySelector('[data-tab-item="issues-tab"]');
        if (!issuesLink) {
            debug('Issues tab not found');
            return;
        }

        const count = getIssueCount();
        if (count === null) {
            debug('Could not determine issue count');
            return;
        }

        // Remove existing badge before adding new one
        removeBadge();

        // Don't add badge if count is 0 to reduce clutter
        if (count === 0) {
            debug('No issues, not adding badge');
            return;
        }

        // Find the best place to add the badge
        const linkText = issuesLink.querySelector('[data-content="Issues"]');
        if (linkText) {
            const badge = createBadge(count);
            linkText.parentNode.insertBefore(badge, linkText.nextSibling);
            debug('Badge added successfully');
        }
    }

    // ==================== Main Functionality ====================
    
    /**
     * Initialize the script
     */
    function init() {
        debug('Script initialized');

        if (!CONFIG.enabled) {
            debug('Script is disabled in configuration');
            return;
        }

        // Check if we're on a GitHub repository page
        const repoInfo = getRepoInfo();
        if (!repoInfo) {
            debug('Not on a repository page, skipping');
            return;
        }

        debug('Repository:', repoInfo.owner + '/' + repoInfo.repo);

        // Add the badge
        addIssueBadge();

        // Monitor for navigation changes (GitHub is a SPA)
        let lastUrl = location.href;
        const observer = new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                debug('URL changed, updating badge');
                setTimeout(addIssueBadge, 500); // Small delay for page to load
            }
        });

        observer.observe(document.body, {
            subtree: true,
            childList: true
        });

        // Periodic update in case the count changes
        setInterval(() => {
            if (getRepoInfo()) {
                addIssueBadge();
            }
        }, CONFIG.updateInterval);
    }

    // ==================== Initialization ====================
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

    debug('GitHub Issue Counter loaded');

})();
