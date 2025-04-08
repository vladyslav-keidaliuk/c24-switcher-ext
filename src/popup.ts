interface Message {
  action: 'getMode' | 'toggleMode' | 'clickLogin' | 'clearCookies' | 'autoLogin';
  credentials?: {
    email: string;
    password: string;
  };
}

interface ModeResponse {
  mode: 'mobile' | 'desktop';
}

interface Credentials {
  email: string;
  password: string;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab?.url) return;

    const tabId = tab.id;
    const toggleSwitch = document.getElementById('toggleSwitch') as HTMLInputElement;
    const statusText = document.getElementById('status') as HTMLSpanElement;
    const openNewTabBtn = document.getElementById('openNewTabBtn') as HTMLButtonElement;
    const loginButton = document.getElementById('loginButton') as HTMLButtonElement;
    const clearCookiesButton = document.getElementById('clearCookiesButton') as HTMLButtonElement;
    const saveCredentialsButton = document.getElementById('saveCredentials') as HTMLButtonElement;
    const deleteCredentialsButton = document.getElementById('deleteCredentials') as HTMLButtonElement;
    const credentialsStatus = document.getElementById('credentialsStatus') as HTMLDivElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Check if we're on a Check24 website
    const isCheck24Website = tab.url.includes('check24');
    clearCookiesButton.disabled = !isCheck24Website;

    // Function to show status message
    function showStatus(message: string, type: 'saved' | 'deleted'): void {
      credentialsStatus.textContent = message;
      credentialsStatus.className = `credentials-status ${type}`;
      credentialsStatus.style.display = 'block';
      setTimeout(() => {
        credentialsStatus.style.display = 'none';
      }, 3000);
    }

    // Load saved credentials
    chrome.storage.local.get(['credentials'], (result) => {
      if (result.credentials) {
        emailInput.value = result.credentials.email;
        passwordInput.value = result.credentials.password;
      }
    });

    // Tab switching functionality
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tabId!)?.classList.add('active');
      });
    });

    // Function to check the cookies and update the view
    async function checkAndSetView(): Promise<void> {
      try {
        // Get the cookies for the current tab's domain
        chrome.cookies.get({ url: tab.url!, name: 'deviceoutput' }, (cookie) => {
          if (cookie) {
            // Check cookie value and set UI accordingly
            if (cookie.value === 'mobile') {
              toggleSwitch.checked = true;
              statusText.innerText = 'Mobile Mode';
            } else {
              toggleSwitch.checked = false;
              statusText.innerText = 'Desktop Mode';
            }
          } else {
            console.warn('No deviceoutput cookie found.');
          }
        });
      } catch (error) {
        console.error('Error checking cookies:', error);
      }
    }

    // Initial check for the current view mode
    await checkAndSetView();

    // Send a message to the content script to get the current mode
    chrome.tabs.sendMessage(tabId, { action: 'getMode' } as Message, (response: ModeResponse) => {
      if (chrome.runtime.lastError) {
        console.warn('Content script not found. Trying to inject...');
        injectContentScript(tabId);
        return;
      }
      if (response?.mode === 'mobile') {
        toggleSwitch.checked = true;
        statusText.innerText = 'Mobile Mode';
      } else {
        toggleSwitch.checked = false;
        statusText.innerText = 'Desktop Mode';
      }
    });

    // Save the state of the switch and update the text accordingly
    toggleSwitch.addEventListener('change', () => {
      chrome.tabs.sendMessage(tabId, { action: 'toggleMode' } as Message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to send message:', chrome.runtime.lastError);
        }
      });

      // Change the text based on the switch state
      if (toggleSwitch.checked) {
        statusText.innerText = 'Mobile Mode';
      } else {
        statusText.innerText = 'Desktop Mode';
      }
    });

    // Add event listener to open a new tab with the appropriate view
    openNewTabBtn.addEventListener('click', () => {
      const url = new URL(tab.url!);
      const leadId = url.searchParams.get('leadId');
      const deviceoutput = url.searchParams.get('deviceoutput');

      let newUrl: string;

      // Construct the new URL with modified 'deviceoutput' parameter
      if (deviceoutput === 'desktop') {
        newUrl = `https://m.internet.check24.de/kundenbereich?leadId=${leadId}&deviceoutput=mobile`;
      } else {
        newUrl = `https://internet.check24.de/kundenbereich?leadId=${leadId}&deviceoutput=desktop`;
      }

      // Open the new URL in a new tab
      chrome.tabs.create({ url: newUrl });
    });

    // Save credentials button click handler
    saveCredentialsButton.addEventListener('click', () => {
      const credentials: Credentials = {
        email: emailInput.value,
        password: passwordInput.value
      };
      
      chrome.storage.local.set({ credentials }, () => {
        showStatus('Credentials saved successfully!', 'saved');
      });
    });

    // Delete credentials button click handler
    deleteCredentialsButton.addEventListener('click', () => {
      chrome.storage.local.remove(['credentials'], () => {
        emailInput.value = '';
        passwordInput.value = '';
        showStatus('Credentials deleted successfully!', 'deleted');
      });
    });

    // Add event listener for login button
    loginButton.addEventListener('click', () => {
      chrome.tabs.sendMessage(tabId, { action: 'clickLogin' } as Message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to send message:', chrome.runtime.lastError);
        }
      });
    });

    // Add event listener for clear cookies button
    clearCookiesButton.addEventListener('click', () => {
      if (isCheck24Website) {
        chrome.tabs.sendMessage(tabId, { action: 'clearCookies' } as Message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to send message:', chrome.runtime.lastError);
          }
        });
      }
    });

  } catch (error) {
    console.error('Error in popup.ts:', error);
  }
});

// Inject content script dynamically if missing
function injectContentScript(tabId: number): void {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to inject content script:', chrome.runtime.lastError);
    }
  });
} 