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

// Function to wait for an element to appear in the DOM
function waitForElement(selector: string, timeout = 10000): Promise<Element | null> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// Function to simulate a real mouseover event
function simulateMouseOver(element: Element): void {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const mouseOverEvent = new MouseEvent('mouseover', {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: centerX,
    clientY: centerY
  });

  element.dispatchEvent(mouseOverEvent);
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response: ModeResponse) => void) => {
  if (message.action === 'getMode') {
    const cookies = document.cookie.split('; ').reduce((acc: Record<string, string>, cookie: string) => {
      const [name, value] = cookie.split('=');
      acc[name] = value;
      return acc;
    }, {});

    sendResponse({ mode: cookies.deviceoutput === 'mobile' ? 'mobile' : 'desktop' });
  }

  if (message.action === 'toggleMode') {
    const cookies = document.cookie.split('; ').reduce((acc: Record<string, string>, cookie: string) => {
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

  if (message.action === 'clickLogin') {
    // Find the customer element and hover it
    const customerElement = document.querySelector('.c24-customer.c24-customer-guest');
    if (customerElement) {
      // Create and dispatch mouseover event
      const mouseOverEvent = new MouseEvent('mouseover', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      customerElement.dispatchEvent(mouseOverEvent);

      // Wait for the login button to appear and click it
      setTimeout(() => {
        const loginButton = document.getElementById('c24-meinkonto-anmelden');
        if (loginButton) {
          loginButton.click();
        }
      }, 500); // Wait for the hover animation to complete
    }
  }

  if (message.action === 'autoLogin' && message.credentials) {
    // Try different selectors for the customer element
    const customerSelectors = [
      '.c24-customer.c24-customer-guest',
      '.c24-customer',
      '[data-testid="customer-menu"]',
      '[data-testid="login-button"]'
    ];

    let customerElement = null;
    for (const selector of customerSelectors) {
      customerElement = document.querySelector(selector);
      if (customerElement) break;
    }

    if (customerElement) {
      console.log('Found customer element, simulating mouseover...');
      simulateMouseOver(customerElement);

      // Try different selectors for the login form elements
      const emailSelectors = [
        '#c24-login-email',
        'input[type="email"]',
        'input[name="email"]',
        '[data-testid="email-input"]'
      ];

      const passwordSelectors = [
        '#c24-login-password',
        'input[type="password"]',
        'input[name="password"]',
        '[data-testid="password-input"]'
      ];

      const submitSelectors = [
        '#c24-login-submit',
        'button[type="submit"]',
        '[data-testid="submit-button"]'
      ];

      // Wait for all form elements to appear
      Promise.all([
        Promise.race(emailSelectors.map(selector => waitForElement(selector))),
        Promise.race(passwordSelectors.map(selector => waitForElement(selector))),
        Promise.race(submitSelectors.map(selector => waitForElement(selector)))
      ]).then(([emailInput, passwordInput, submitButton]) => {
        if (emailInput && passwordInput && submitButton) {
          console.log('Found all login form elements, filling credentials...');
          (emailInput as HTMLInputElement).value = message.credentials!.email;
          (passwordInput as HTMLInputElement).value = message.credentials!.password;

          // Submit the form
          (submitButton as HTMLButtonElement).click();
        } else {
          console.error('Login form elements not found after waiting');
        }
      });
    } else {
      console.error('Customer element not found with any selector');
    }
  }

  if (message.action === 'clearCookies') {
    // Determine if we're on a test domain
    const domain = window.location.hostname;
    const isTestDomain = domain.includes('check24-test');
    
    // Clear cookies using document.cookie for immediate effect
    const cookies = document.cookie.split('; ');
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      // Try to remove cookie with different domain variations
      [
        domain,
        domain.replace(/^www\./, ''),
        `.${domain.replace(/^www\./, '')}`,
        domain.replace(/^.*\.(?=check24)/, ''),
        `.${domain.replace(/^.*\.(?=check24)/, '')}`
      ].forEach(d => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${d}`;
      });
    });

    // Use Chrome cookies API to clear all cookies for the matching domain type
    chrome.runtime.sendMessage({ 
      action: 'clearAllCookies',
      isTestDomain: isTestDomain 
    }, () => {
      // Reload the page after clearing cookies
      location.reload();
    });
  }
}); 