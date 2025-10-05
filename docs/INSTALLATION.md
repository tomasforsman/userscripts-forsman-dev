# Installation Guide

This guide will help you get started with userscripts and install scripts from this collection.

## Table of Contents

- [What You Need](#what-you-need)
- [Installing a Userscript Manager](#installing-a-userscript-manager)
- [Installing Scripts](#installing-scripts)
- [Managing Scripts](#managing-scripts)
- [Troubleshooting](#troubleshooting)

## What You Need

To use userscripts, you need:
1. A web browser (Chrome, Firefox, Edge, Safari, etc.)
2. A userscript manager extension
3. The userscript file you want to install

## Installing a Userscript Manager

### For Chrome, Edge, Brave, Opera

**Tampermonkey** (Recommended)
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojoecelmmmnbdhnbh)
2. Click "Add to Chrome" (or your browser name)
3. Confirm the installation

**Violentmonkey** (Alternative)
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
2. Click "Add to Chrome"
3. Confirm the installation

### For Firefox

**Tampermonkey** (Recommended)
1. Visit [Tampermonkey for Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
2. Click "Add to Firefox"
3. Confirm the installation

**Greasemonkey** (Alternative)
1. Visit [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/)
2. Click "Add to Firefox"
3. Confirm the installation

### For Safari

**Userscripts**
1. Visit the [Userscripts repository](https://github.com/quoid/userscripts)
2. Download the latest release
3. Follow the installation instructions in the repository

## Installing Scripts

### Method 1: Direct Installation (Easiest)

1. Browse to the script you want in the [scripts/](../scripts/) directory
2. Click on the script file (e.g., `example-script.user.js`)
3. Click the **"Raw"** button at the top of the file view
4. Your userscript manager will automatically detect the script
5. Click **"Install"** in the popup that appears

### Method 2: Manual Installation

1. Copy the entire script content from GitHub
2. Open your userscript manager dashboard:
   - Click the extension icon in your browser
   - Select "Dashboard" or "Create a new script"
3. Paste the script into the editor
4. Save the script (usually Ctrl+S or File → Save)

### Method 3: Local File Installation

1. Download the `.user.js` file to your computer
2. Open your userscript manager dashboard
3. Drag and drop the file into the dashboard
4. Confirm the installation

## Managing Scripts

### Enabling/Disabling Scripts

**In Tampermonkey:**
1. Click the Tampermonkey icon in your browser toolbar
2. Find your script in the list
3. Toggle the switch next to the script name

**In Greasemonkey:**
1. Click the Greasemonkey icon
2. Toggle the checkbox next to the script

### Editing Scripts

1. Open your userscript manager dashboard
2. Find the script you want to edit
3. Click the edit icon or script name
4. Make your changes
5. Save the script

### Updating Scripts

Most userscript managers will automatically check for updates if the script includes an `@updateURL` in its metadata. You can also:

1. Open the dashboard
2. Check for updates manually (usually in the settings or utilities section)
3. Reinstall the script following the installation steps

### Removing Scripts

1. Open your userscript manager dashboard
2. Find the script you want to remove
3. Click the trash/delete icon
4. Confirm the deletion

## Troubleshooting

### Script Not Running

**Check if the script is enabled:**
- Open your userscript manager and verify the script is toggled on

**Check the URL pattern:**
- The script only runs on websites that match its `@match` pattern
- Verify you're on the correct website

**Check browser console for errors:**
1. Press F12 to open Developer Tools
2. Go to the Console tab
3. Look for any error messages related to the script

### Script Conflicts

If multiple scripts interfere with each other:
1. Disable all scripts
2. Enable them one by one to identify the conflict
3. Report the issue or adjust script priorities in your manager

### Performance Issues

If a script is slowing down your browser:
1. Check if the script has a debug mode you can disable
2. Review the script's code for optimization opportunities
3. Consider disabling the script on pages where it's not needed

### Permission Issues

Some scripts require special permissions (`@grant` directives):
- Reinstall the script to ensure all permissions are granted
- Check your userscript manager's settings for permission restrictions

## Getting Help

If you encounter issues:

1. **Check the script's comments** - Many scripts include usage notes
2. **Review the repository issues** - Someone may have had the same problem
3. **Open a new issue** - Provide details about your browser, userscript manager, and the problem
4. **Consult the documentation** for your userscript manager:
   - [Tampermonkey FAQ](https://www.tampermonkey.net/faq.php)
   - [Greasemonkey Help](https://www.greasespot.net/)

## Security Notes

⚠️ **Important Security Information:**

- Only install scripts from trusted sources
- Review the script code before installing (especially if it requires special permissions)
- Be cautious with scripts that request access to sensitive data
- Keep your userscript manager updated
- Report any security concerns to the repository maintainer

## Best Practices

1. **Review before installing** - Always read what a script does
2. **Keep scripts updated** - Enable automatic updates when possible
3. **Don't install too many** - Only install scripts you actually use
4. **Test on non-critical sites first** - Verify functionality before relying on a script
5. **Backup your scripts** - Export your scripts regularly from the dashboard

## Additional Resources

- [Greasy Fork](https://greasyfork.org/) - Popular userscript repository
- [OpenUserJS](https://openuserjs.org/) - Another userscript repository
- [Userscript Beginners Guide](https://simply-how.com/enhance-and-fine-tune-any-web-page-the-complete-user-scripts-guide)
- [Writing Userscripts Tutorial](https://wiki.greasespot.net/Greasemonkey_Manual:Getting_Started)
