/**
 * Injected Script
 * 
 * This script runs in the page context and exposes window.ethereum
 * to dApps. It communicates with the content script via window.postMessage.
 */

import { EthereumProvider } from './provider';

// Create provider instance
const provider = new EthereumProvider();

// Inject into window
(window as Window & typeof globalThis & { ethereum?: EthereumProvider }).ethereum = provider;

// Also inject as window.web3 for legacy compatibility
(window as Window & typeof globalThis & { web3?: { currentProvider: EthereumProvider } }).web3 = {
  currentProvider: provider,
};

// Announce provider availability (EIP-6963)
function announceProvider() {
  // Custom wave/pin logo with blue-to-teal gradient
  const iconSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDcyZmY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGM5YTc7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBkPSJNNTAgMCBDMjIuNCAwIDAgMjIuNCAwIDUwIEMwIDcwIDIwIDk1IDUwIDE0MCBDODAgOTUgMTAwIDcwIDEwMCA1MCBDMTAwIDIyLjQgNzcuNiAwIDUwIDAgWiIgZmlsbD0idXJsKCNncmFkKSIvPjxwYXRoIGQ9Ik0xNSAyNSBRMzUgMTUgNTAgMjUgUTY1IDE1IDg1IDI1IEw4NSAyMCBRNjUgNSA1MCAxNSBRMzUgNSAxNSAyMCBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0yNSA3NSBRNDAgNjUgNTUgNzUgUTcwIDY1IDgwIDc1IEw4MCA3MCBRNzAgNTUgNTUgNjUgUTQwIDU1IDI1IDcwIFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+`;
  
  const info = {
    uuid: 'zeroconnect-wallet',
    name: 'ZeroConnectWallet',
    icon: iconSvg,
    rdns: 'com.zeroconnect.wallet',
  };

  const event = new CustomEvent('eip6963:announceProvider', {
    detail: { provider, info },
  });
  window.dispatchEvent(event);
}

// Announce on load
announceProvider();

// Re-announce if requested
window.addEventListener('eip6963:requestProvider', () => {
  announceProvider();
});

console.log('🔷 ZeroConnectWallet provider injected');
