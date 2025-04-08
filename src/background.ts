// Background script can be empty for now as it doesn't contain any functionality
// It's required by the manifest but doesn't need to do anything

// Handle clearing cookies for Check24 domains
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clearAllCookies') {
    // Get all cookies for all domains
    chrome.cookies.getAll({}, (allCookies) => {
      // Filter cookies based on whether we're on a test or production domain
      const check24Cookies = allCookies.filter(cookie => {
        if (message.isTestDomain) {
          return cookie.domain.includes('check24-test');
        } else {
          return cookie.domain.includes('check24') && !cookie.domain.includes('check24-test');
        }
      });

      // Remove each matching cookie
      const removePromises = check24Cookies.map(cookie => {
        // Try both with and without 'www' prefix
        const urls = [
          `https://${cookie.domain}${cookie.path}`,
          `https://www.${cookie.domain}${cookie.path}`,
          // Also try the root domain
          `https://${cookie.domain.replace(/^.*\.(?=check24)/, '')}${cookie.path}`
        ];

        // Try to remove cookie with each URL variation
        return urls.map(url => new Promise(resolve => {
          chrome.cookies.remove({
            url: url,
            name: cookie.name
          }, () => resolve(true));
        }));
      }).flat();

      // Wait for all cookies to be removed
      Promise.all(removePromises).then(() => {
        sendResponse({ success: true });
      });
    });

    // Return true to indicate we'll call sendResponse asynchronously
    return true;
  }
}); 