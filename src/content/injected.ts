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
  // Wallet icon as data URI (black wallet with "ro" text)
  const iconSvg = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3QgeD0iMTAiIHk9IjI1IiB3aWR0aD0iNzAiIGhlaWdodD0iNTAiIHJ4PSI4IiByeT0iOCIgZmlsbD0iIzFhMWExYSIgc3Ryb2tlPSIjMWExYTFhIiBzdHJva2Utd2lkdGg9IjMiLz48cmVjdCB4PSIxNSIgeT0iMzAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0MCIgcng9IjUiIHJ5PSI1IiBmaWxsPSIjMWExYTFhIi8+PHRleHQgeD0iNDIiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+cm88L3RleHQ+PHBhdGggZD0iTSA3NSAzNSBMIDkwIDM1IEEgNSA1IDAgMCAxIDk1IDQwIEwgOTUgNjAgQSA1IDUgMCAwIDEgOTAgNjUgTCA3NSA2NSBBIDEwIDEwIDAgMCAxIDc1IDM1IiBmaWxsPSIjMWExYTFhIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSI4NSIgY3k9IjUwIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==`;
  
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
