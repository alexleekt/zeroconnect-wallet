import type { WalletConfig } from './types';

/**
 * Message Types for communication between contexts
 */

// Messages from content script to background
export type BackgroundMessage =
  | { type: 'CONNECT_REQUEST'; addresses: string[] }
  | { type: 'GET_CONFIG' }
  | { type: 'RPC_REQUEST'; method: string; params: unknown[] }
  | { type: 'UPDATE_CONFIG'; config: Partial<WalletConfig> }
  | { type: 'GET_CONNECTION_STATE' };

// Responses from background to content script
export type BackgroundResponse =
  | { type: 'CONFIG'; config: WalletConfig }
  | { type: 'CONNECTION_APPROVED'; selectedAddress: string }
  | { type: 'CONNECTION_REJECTED' }
  | { type: 'RPC_RESPONSE'; result: unknown; error?: { code: number; message: string } }
  | { type: 'CONNECTION_STATE'; state: { isConnected: boolean; selectedAddress: string | null; chainId: string } }
  | { type: 'CONFIG_UPDATED'; config: WalletConfig };

// Messages from background to popup
export type PopupMessage =
  | { type: 'SHOW_ADDRESS_SELECTOR'; addresses: string[] }
  | { type: 'GET_CONFIG' }
  | { type: 'SET_CONFIG'; config: WalletConfig }
  | { type: 'RESET_CONFIG' };

// Messages from popup to background
export type PopupResponse =
  | { type: 'ADDRESS_SELECTED'; address: string }
  | { type: 'SELECTION_CANCELLED' }
  | { type: 'CONFIG_DATA'; config: WalletConfig }
  | { type: 'CONFIG_SAVED' };

/**
 * Send message to background script from content script
 */
export function sendToBackground(
  message: BackgroundMessage
): Promise<BackgroundResponse> {
  return browser.runtime.sendMessage(message);
}

/**
 * Send message to popup from background (opens popup if needed)
 */
export async function sendToPopup(
  message: PopupMessage
): Promise<PopupResponse> {
  // Open popup if not already open
  const windows = await browser.windows.getAll({ populate: true });
  const popupWindow = windows.find(
    (w) => w.type === 'popup' && w.tabs?.some((t) => t.url?.includes('popup'))
  );

  if (!popupWindow) {
    // Create popup window
    await browser.windows.create({
      url: browser.runtime.getURL('popup/index.html'),
      type: 'popup',
      width: 360,
      height: 600,
    });
  }

  // Send message to popup
  return browser.runtime.sendMessage(message);
}
