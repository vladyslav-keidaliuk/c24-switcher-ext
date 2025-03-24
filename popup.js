// document.addEventListener("DOMContentLoaded", async function () {
//     try {
//         let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         if (!tab) return;

//         const toggleSwitch = document.getElementById("toggleSwitch");
//         const statusText = document.getElementById("status");
//         const openNewTabBtn = document.getElementById("openNewTabBtn");

//         // Function to check the cookies and update the view
//         async function checkAndSetView() {
//             try {
//                 // Get the cookies for the current tab's domain
//                 chrome.cookies.get({ url: tab.url, name: "deviceoutput" }, (cookie) => {
//                     if (cookie) {
//                         // Check cookie value and set UI accordingly
//                         if (cookie.value === "mobile") {
//                             toggleSwitch.checked = true;
//                             statusText.innerText = "Mobile Mode";
//                         } else {
//                             toggleSwitch.checked = false;
//                             statusText.innerText = "Desktop Mode";
//                         }
//                     } else {
//                         console.warn("No deviceoutput cookie found.");
//                     }
//                 });
//             } catch (error) {
//                 console.error("Error checking cookies:", error);
//             }
//         }

//         // Initial check for the current view mode
//         checkAndSetView();

//         // Send a message to the content script to get the current mode
//         chrome.tabs.sendMessage(tab.id, { action: "getMode" }, (response) => {
//             if (chrome.runtime.lastError) {
//                 console.warn("Content script not found. Trying to inject...");
//                 injectContentScript(tab.id);
//                 return;
//             }
//             if (response?.mode === "mobile") {
//                 toggleSwitch.checked = true;
//                 statusText.innerText = "Mobile Mode";
//             } else {
//                 toggleSwitch.checked = false;
//                 statusText.innerText = "Desktop Mode";
//             }
//         });

//         // Save the state of the switch and update the text accordingly
//         toggleSwitch.addEventListener("change", () => {
//             chrome.tabs.sendMessage(tab.id, { action: "toggleMode" }, (response) => {
//                 if (chrome.runtime.lastError) {
//                     console.error("Failed to send message:", chrome.runtime.lastError);
//                 }
//             });

//             // Change the text based on the switch state
//             if (toggleSwitch.checked) {
//                 statusText.innerText = "Mobile Mode";
//             } else {
//                 statusText.innerText = "Desktop Mode";
//             }
//         });

//         // Add event listener to open a new tab with the appropriate view
//         openNewTabBtn.addEventListener("click", () => {
//             const url = tab.url;
//             let newUrl;

//             // Check the current view and create a new URL based on it
//             if (toggleSwitch.checked) {
//                 newUrl = url.replace("internet.check24.de", "m.internet.check24.de").replace("deviceoutput=desktop", "deviceoutput=mobile");
//             } else {
//                 newUrl = url.replace("m.internet.check24.de", "internet.check24.de").replace("deviceoutput=mobile", "deviceoutput=desktop");
//             }

//             // Open the new URL in a new tab
//             chrome.tabs.create({ url: newUrl });
//         });

//     } catch (error) {
//         console.error("Error in popup.js:", error);
//     }
// });

// // Inject content script dynamically if missing
// function injectContentScript(tabId) {
//     chrome.scripting.executeScript({
//         target: { tabId: tabId },
//         files: ["content.js"]
//     }, () => {
//         if (chrome.runtime.lastError) {
//             console.error("Failed to inject content script:", chrome.runtime.lastError);
//         }
//     });
// }


document.addEventListener("DOMContentLoaded", async function () {
    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        const toggleSwitch = document.getElementById("toggleSwitch");
        const statusText = document.getElementById("status");
        const openNewTabBtn = document.getElementById("openNewTabBtn");

        // Function to check the cookies and update the view
        async function checkAndSetView() {
            try {
                // Get the cookies for the current tab's domain
                chrome.cookies.get({ url: tab.url, name: "deviceoutput" }, (cookie) => {
                    if (cookie) {
                        // Check cookie value and set UI accordingly
                        if (cookie.value === "mobile") {
                            toggleSwitch.checked = true;
                            statusText.innerText = "Mobile Mode";
                        } else {
                            toggleSwitch.checked = false;
                            statusText.innerText = "Desktop Mode";
                        }
                    } else {
                        console.warn("No deviceoutput cookie found.");
                    }
                });
            } catch (error) {
                console.error("Error checking cookies:", error);
            }
        }

        // Initial check for the current view mode
        checkAndSetView();

        // Send a message to the content script to get the current mode
        chrome.tabs.sendMessage(tab.id, { action: "getMode" }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Content script not found. Trying to inject...");
                injectContentScript(tab.id);
                return;
            }
            if (response?.mode === "mobile") {
                toggleSwitch.checked = true;
                statusText.innerText = "Mobile Mode";
            } else {
                toggleSwitch.checked = false;
                statusText.innerText = "Desktop Mode";
            }
        });

        // Save the state of the switch and update the text accordingly
        toggleSwitch.addEventListener("change", () => {
            chrome.tabs.sendMessage(tab.id, { action: "toggleMode" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Failed to send message:", chrome.runtime.lastError);
                }
            });

            // Change the text based on the switch state
            if (toggleSwitch.checked) {
                statusText.innerText = "Mobile Mode";
            } else {
                statusText.innerText = "Desktop Mode";
            }
        });

        // Add event listener to open a new tab with the appropriate view
        openNewTabBtn.addEventListener("click", () => {
            const url = new URL(tab.url);
            const leadId = url.searchParams.get("leadId");  // Extract the leadId
            const deviceoutput = url.searchParams.get("deviceoutput");  // Extract deviceoutput

            let newUrl;

            // Construct the new URL with modified 'deviceoutput' parameter
            if (deviceoutput === "desktop") {
                newUrl = `https://m.internet.check24.de/kundenbereich?leadId=${leadId}&deviceoutput=mobile`;
            } else {
                newUrl = `https://internet.check24.de/kundenbereich?leadId=${leadId}&deviceoutput=desktop`;
            }

            // Open the new URL in a new tab
            chrome.tabs.create({ url: newUrl });
        });

    } catch (error) {
        console.error("Error in popup.js:", error);
    }
});

// Inject content script dynamically if missing
function injectContentScript(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Failed to inject content script:", chrome.runtime.lastError);
        }
    });
}
