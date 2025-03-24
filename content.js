chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getMode") {
        let cookies = document.cookie.split("; ").reduce((acc, cookie) => {
            let [name, value] = cookie.split("=");
            acc[name] = value;
            return acc;
        }, {});

        // Check the cookie values to determine the current mode
        sendResponse({ mode: cookies.deviceoutput === "mobile" ? "mobile" : "desktop" });
    }

    if (message.action === "toggleMode") {
        let cookies = document.cookie.split("; ").reduce((acc, cookie) => {
            let [name, value] = cookie.split("=");
            acc[name] = value;
            return acc;
        }, {});

        // Determine new mode based on current mode
        let newMode = cookies.deviceoutput === "mobile" ? "desktop" : "mobile";

        // Set the cookies on .check24.de domain
        document.cookie = `deviceoutput=${newMode}; domain=.check24.de; path=/; SameSite=Lax`;
        document.cookie = `devicetype=${newMode}; domain=.check24.de; path=/; SameSite=Lax`;

        // Get the current URL and update the deviceoutput parameter
        let currentUrl = window.location.href;
        let url = new URL(currentUrl);

        // Modify the deviceoutput parameter in the URL
        url.searchParams.set('deviceoutput', newMode);

        // Check if the mobile version of the URL is needed
        if (newMode === 'mobile') {
            url.hostname = `m.${url.hostname}`;  // Switch to mobile version of the site
        } else {
            url.hostname = url.hostname.replace(/^m\./, '');  // Switch back to desktop version
        }

        // Navigate to the new URL and reload the page
        window.location.replace(url.href);  // This will update the URL and load the page
    }
});
