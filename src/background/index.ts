/**
 * Background Script
 * 
 * Central message router and state manager
 */

console.log('🔷 Background script starting...');

import { getConfig, saveConfig, updateConfig } from '../shared/config';
import type { BackgroundMessage, BackgroundResponse } from '../shared/messages';

// In-memory connection state (lost when extension restarts, but config is persisted)
interface ConnectionState {
  isConnected: boolean;
  selectedAddress: string | null;
  chainId: string;
}

const connectionState: ConnectionState = {
  isConnected: false,
  selectedAddress: null,
  chainId: '0x1',
};

// Pending connection requests
let pendingConnectionRequest: {
  resolve: (address: string) => void;
  reject: () => void;
} | null = null;

// Track popup window ID
let popupWindowId: number | null = null;

/**
 * Handle messages from content scripts and popup
 */
browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  console.log('Background: Received:', message?.type);
  
  (async () => {
    try {
      let response: any;
      
      switch (message.type) {
        case 'CONNECT_REQUEST':
          response = await handleConnectRequest();
          break;
          
        case 'GET_CONFIG':
          response = handleGetConfig();
          break;
          
        case 'UPDATE_CONFIG':
          response = await handleUpdateConfig(message.config);
          break;
          
        case 'RPC_REQUEST':
          response = await handleRpcRequest(message.method, message.params);
          break;
          
        case 'GET_CONNECTION_STATE':
          response = handleGetConnectionState();
          break;
          
        case 'ADDRESS_SELECTED':
          if (pendingConnectionRequest) {
            pendingConnectionRequest.resolve(message.address);
            pendingConnectionRequest = null;
          }
          response = { type: 'SELECTION_ACK', success: true };
          break;
          
        case 'SELECTION_CANCELLED':
          if (pendingConnectionRequest) {
            pendingConnectionRequest.reject();
            pendingConnectionRequest = null;
          }
          response = { type: 'SELECTION_ACK', success: true };
          break;
          
        case 'SHOW_REJECTION_NOTIFICATION':
          showRejectionNotification(message.method);
          response = undefined;
          break;
          
        default:
          console.log('Background: Unknown type:', message.type);
          response = undefined;
      }
      
      console.log('Background: Responding with:', response);
      sendResponse(response);
    } catch (error) {
      console.error('Background: Error:', error);
      sendResponse(undefined);
    }
  })();
  
  return true; // Keep channel open for async
});

/**
 * Handle connection request from content script
 */
async function handleConnectRequest(): Promise<BackgroundResponse> {
  const config = await getConfig();

  console.log('Background: Config loaded:', config);

  if (config.addresses.length === 0) {
    console.log('Background: No addresses configured, rejecting');
    return {
      type: 'CONNECTION_REJECTED',
    };
  }

  // Check if we have a last connected address that's still valid
  if (config.lastConnectedAddress && 
      config.addresses.includes(config.lastConnectedAddress)) {
    console.log('Background: Using last connected address:', config.lastConnectedAddress);
    connectionState.isConnected = true;
    connectionState.selectedAddress = config.lastConnectedAddress;
    connectionState.chainId = config.chainId;

    return {
      type: 'CONNECTION_APPROVED',
      selectedAddress: config.lastConnectedAddress,
    };
  }

  // If only one address, auto-connect
  if (config.addresses.length === 1) {
    const address = config.addresses[0];
    console.log('Background: Auto-connecting with single address:', address);
    connectionState.isConnected = true;
    connectionState.selectedAddress = address;
    connectionState.chainId = config.chainId;

    // Save as last connected
    await updateConfig({ lastConnectedAddress: address });

    return {
      type: 'CONNECTION_APPROVED',
      selectedAddress: address,
    };
  }

  // Multiple addresses - show popup for selection
  console.log('Background: Multiple addresses, showing selector popup');
  return new Promise((resolve) => {
    pendingConnectionRequest = {
      resolve: (address: string) => {
        connectionState.isConnected = true;
        connectionState.selectedAddress = address;
        connectionState.chainId = config.chainId;

        // Save as last connected
        updateConfig({ lastConnectedAddress: address });

        resolve({
          type: 'CONNECTION_APPROVED',
          selectedAddress: address,
        });
      },
      reject: () => {
        resolve({
          type: 'CONNECTION_REJECTED',
        });
      },
    };

    // Open popup to show address selector
    openAddressSelector(config.addresses);
  });
}

/**
 * Open popup with address selector
 */
async function openAddressSelector(addresses: string[]) {
  try {
    // Store addresses temporarily for popup to read
    await browser.storage.local.set({ pendingAddresses: addresses });

    // Open popup window (wider for better UX)
    const window = await browser.windows.create({
      url: browser.runtime.getURL('popup/index.html?mode=selector'),
      type: 'popup',
      width: 420,
      height: 600,
    });

    // Track the popup window ID
    popupWindowId = window.id ?? null;

    // Listen for window close
    const handleWindowRemoved = (windowId: number) => {
      if (windowId === popupWindowId && pendingConnectionRequest) {
        console.log('Background: Popup closed without selection');
        pendingConnectionRequest.reject();
        pendingConnectionRequest = null;
        popupWindowId = null;
        browser.windows.onRemoved.removeListener(handleWindowRemoved);
      }
    };

    browser.windows.onRemoved.addListener(handleWindowRemoved);

    // Also set a timeout in case the popup never responds
    setTimeout(() => {
      if (pendingConnectionRequest) {
        console.log('Background: Selection timeout');
        pendingConnectionRequest.reject();
        pendingConnectionRequest = null;
        popupWindowId = null;
        browser.windows.onRemoved.removeListener(handleWindowRemoved);
      }
    }, 60000); // 1 minute timeout

  } catch (error) {
    console.error('Failed to open address selector:', error);
    // Reject pending request
    if (pendingConnectionRequest) {
      pendingConnectionRequest.reject();
      pendingConnectionRequest = null;
    }
  }
}

/**
 * Handle get config request
 */
async function handleGetConfig(): Promise<BackgroundResponse> {
  const config = await getConfig();
  return {
    type: 'CONFIG',
    config,
  };
}

/**
 * Handle update config request
 */
async function handleUpdateConfig(
  updates: Partial<import('../shared/types').WalletConfig>
): Promise<BackgroundResponse> {
  const newConfig = await updateConfig(updates);
  
  // Update connection state if chain changed
  if (updates.chainId) {
    connectionState.chainId = updates.chainId;
  }

  return {
    type: 'CONFIG_UPDATED',
    config: newConfig,
  };
}

/**
 * Handle RPC request by forwarding to configured endpoint
 */
async function handleRpcRequest(
  method: string,
  params: unknown[]
): Promise<BackgroundResponse> {
  try {
    const config = await getConfig();
    
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        type: 'RPC_RESPONSE',
        result: null,
        error: {
          code: data.error.code,
          message: data.error.message,
        },
      };
    }

    return {
      type: 'RPC_RESPONSE',
      result: data.result,
    };
  } catch (error) {
    return {
      type: 'RPC_RESPONSE',
      result: null,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'RPC request failed',
      },
    };
  }
}

/**
 * Handle get connection state request
 */
function handleGetConnectionState(): BackgroundResponse {
  return {
    type: 'CONNECTION_STATE',
    state: { ...connectionState },
  };
}

/**
 * Show notification when signing is rejected
 */
function showRejectionNotification(method: string) {
  console.log(`Background: Showing rejection notification for ${method}`);
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('assets/icon-48.png'),
    title: 'ZeroConnectWallet - Read Only',
    message: `Cannot ${method}: This is a read-only wallet for viewing balances only.`,
  });
}

/**
 * Handle installation
 */
browser.runtime.onInstalled.addListener(() => {
  console.log('🔷 ZeroConnectWallet installed');
});
