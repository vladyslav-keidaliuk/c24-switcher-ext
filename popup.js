// document.addEventListener("DOMContentLoaded", async function () {
//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (!tab) return;

//     const toggleSwitch = document.getElementById("toggleSwitch");
//     const statusText = document.getElementById("status");

//     // Send a message to the content script to get the current mode
//     chrome.tabs.sendMessage(tab.id, { action: "getMode" }, (response) => {
//         if (chrome.runtime.lastError) {
//             console.warn("Content script not found. Trying to inject...");
//             injectContentScript(tab.id);
//             return;
//         }
//         if (response?.mode === "mobile") {
//             toggleSwitch.checked = true;
//             statusText.innerText = "Mobile Mode";
//         } else {
//             toggleSwitch.checked = false;
//             statusText.innerText = "Desktop Mode";
//         }
//     });

//     // Handle the switch state change
//     toggleSwitch.addEventListener("change", () => {
//         chrome.tabs.sendMessage(tab.id, { action: "toggleMode" }, (response) => {
//             if (chrome.runtime.lastError) {
//                 console.error("Failed to send message:", chrome.runtime.lastError);
//             }
//         });

//         // Change the text based on the switch state
//         if (toggleSwitch.checked) {
//             statusText.innerText = "Mobile Mode";
//         } else {
//             statusText.innerText = "Desktop Mode";
//         }
//     });
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
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const toggleSwitch = document.getElementById("toggleSwitch");
    const statusText = document.getElementById("status");

    // Try sending a message to the content script to get the current mode
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

    // Handle the switch state change
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

chrome.tabs.sendMessage(tab.id, { action: "getMode" }, (response) => {
    if (chrome.runtime.lastError) {
        console.warn("Error in sending message:", chrome.runtime.lastError);
        return;
    }
    console.log("Response from content script:", response);
});
