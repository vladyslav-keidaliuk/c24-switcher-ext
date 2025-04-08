"use strict";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getMode') {
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            acc[name] = value;
            return acc;
        }, {});
        sendResponse({ mode: cookies.deviceoutput === 'mobile' ? 'mobile' : 'desktop' });
    }
    if (message.action === 'toggleMode') {
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            acc[name] = value;
            return acc;
        }, {});
        // Determine new mode (toggle)
        const newMode = cookies.deviceoutput === 'mobile' ? 'desktop' : 'mobile';
        // Set cookies at `.check24.de` domain
        document.cookie = `deviceoutput=${newMode}; domain=.check24.de; path=/; SameSite=Lax`;
        document.cookie = `devicetype=${newMode}; domain=.check24.de; path=/; SameSite=Lax`;
        // Reload the page to apply the changes
        location.reload();
    }
});
