/**
 * Content Script Entry Point
 * 
 * This script runs in the content script context and injects the provider
 * into the page context via a script tag.
 */

function injectScript() {
  const script = document.createElement('script');
  script.src = browser.runtime.getURL('content/injected.js');
  script.type = 'text/javascript';
  script.onload = () => {
    script.remove();
  };
  
  // Inject at document start to ensure provider is available early
  const parent = document.head || document.documentElement;
  parent.insertBefore(script, parent.children[0]);
}

// Inject the provider script
injectScript();

// Listen for messages from the injected script and forward to background
window.addEventListener('message', async (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  const message = event.data;
  
  // Handle messages from injected script
  if (message?.type === 'ZEROCONNECT_REQUEST') {
    console.log('Content script: Received request:', message.payload?.type, 'requestId:', message.requestId);
    
    try {
      // Forward to background script
      console.log('Content script: Sending to background...');
      const response = await browser.runtime.sendMessage(message.payload);
      console.log('Content script: Got response from background:', JSON.stringify(response));
      
      // Send response back to injected script
      console.log('Content script: Sending response to injected script, requestId:', message.requestId);
      window.postMessage({
        type: 'ZEROCONNECT_RESPONSE',
        payload: response,
        requestId: message.requestId,
      }, '*');
    } catch (error) {
      console.error('Content script: Error:', error);
      window.postMessage({
        type: 'ZEROCONNECT_RESPONSE',
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: message.requestId,
      }, '*');
    }
  }
});
