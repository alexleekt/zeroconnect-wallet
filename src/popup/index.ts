import { getConfig, isValidAddress, parseAddressList, updateConfig } from '../shared/config';
import type { WalletConfig } from '../shared/types';

/**
 * Popup Entry Point
 *
 * Supports two modes:
 * - Config mode: Manage wallet addresses, network, RPC settings
 * - Selector mode: Choose which address to connect with (triggered by dApp connection request)
 */

// DOM Elements
const selectorSection = document.getElementById('selector-section') as HTMLElement;
const configSection = document.getElementById('config-section') as HTMLElement;
const addressList = document.getElementById('address-list') as HTMLElement;
const addressesInput = document.getElementById('addresses-input') as HTMLTextAreaElement;
const chainSelect = document.getElementById('chain-select') as HTMLSelectElement;
const rpcInput = document.getElementById('rpc-input') as HTMLInputElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;
const disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement;
const statusIndicator = document.getElementById('status-indicator') as HTMLElement;
const statusText = document.getElementById('status-text') as HTMLElement;
const connectedAddress = document.getElementById('connected-address') as HTMLElement;

// State
let currentConfig: WalletConfig | null = null;
let isSelectorMode = false;

/**
 * Initialize popup
 */
async function init() {
  // Check URL params for mode (legacy desktop popup window)
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get('mode') === 'selector';

  // Check storage for pending selector (mobile / inline mode)
  const storageResult = await browser.storage.local.get(['selectorPending', 'pendingAddresses']);
  const storageMode = storageResult.selectorPending === true;

  isSelectorMode = urlMode || storageMode;

  if (isSelectorMode) {
    await initSelectorMode();
  } else {
    await initConfigMode();
  }
}

/**
 * Initialize in address selector mode
 */
async function initSelectorMode() {
  // Show selector section, hide config
  selectorSection.classList.remove('hidden');
  configSection.classList.add('hidden');

  // Get pending addresses from storage
  const result = await browser.storage.local.get('pendingAddresses');
  const addresses = (result.pendingAddresses as string[]) || [];

  if (addresses.length === 0) {
    // No addresses pending — clear flag and show config
    await browser.storage.local.remove(['selectorPending', 'pendingAddresses']);
    switchToConfigMode();
    return;
  }

  // Render address list
  renderAddressSelector(addresses);

  // Setup cancel button (onclick prevents duplicate listeners on re-init)
  cancelBtn.onclick = async () => {
    await browser.storage.local.remove(['selectorPending', 'pendingAddresses']);
    browser.runtime.sendMessage({ type: 'SELECTION_CANCELLED' });
    // On mobile inline mode, switch back to config instead of closing
    if (window.innerWidth <= 480) {
      switchToConfigMode();
    } else {
      window.close();
    }
  };
}

/**
 * Switch from selector mode back to config mode (inline / mobile)
 */
async function switchToConfigMode() {
  isSelectorMode = false;
  selectorSection.classList.add('hidden');
  configSection.classList.remove('hidden');
  await initConfigMode();
}

/**
 * Render address selector
 */
function renderAddressSelector(addresses: string[]) {
  addressList.textContent = '';

  for (const address of addresses) {
    const item = document.createElement('div');
    item.className = 'address-item';

    const addressSpan = document.createElement('span');
    addressSpan.className = 'address';
    addressSpan.textContent = address;

    const indicatorSpan = document.createElement('span');
    indicatorSpan.className = 'select-indicator';

    item.appendChild(addressSpan);
    item.appendChild(indicatorSpan);

    item.addEventListener('click', async () => {
      // Send selection to background and wait for confirmation
      try {
        console.log('ZeroConnectWallet: Selecting address', address);
        await browser.runtime.sendMessage({
          type: 'ADDRESS_SELECTED',
          address,
        });
        console.log('ZeroConnectWallet: Address selection sent successfully');
      } catch (error) {
        console.error('ZeroConnectWallet: Failed to send address selection:', error);
      }

      // Clear pending selector state
      await browser.storage.local.remove(['selectorPending', 'pendingAddresses']);

      // On mobile / narrow screens, switch back to config mode inline
      // so the user sees the updated connection status
      if (window.innerWidth <= 480) {
        await switchToConfigMode();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 200));
        window.close();
      }
    });

    addressList.appendChild(item);
  }
}

/**
 * Initialize in configuration mode
 */
async function initConfigMode() {
  // Show config section, hide selector
  selectorSection.classList.add('hidden');
  configSection.classList.remove('hidden');

  // Load current config
  currentConfig = await getConfig();

  // Populate form
  if (currentConfig.addresses.length > 0) {
    addressesInput.value = currentConfig.addresses.join('\n');
  }
  chainSelect.value = currentConfig.chainId;
  rpcInput.value = currentConfig.rpcUrl;

  // Update status
  await updateConnectionStatus();

  // Setup event listeners (only once — guard against re-init)
  saveBtn.onclick = handleSave;
  disconnectBtn.onclick = handleDisconnect;
}

/**
 * Update connection status display
 */
async function updateConnectionStatus() {
  try {
    const response = await browser.runtime.sendMessage({
      type: 'GET_CONNECTION_STATE',
    });

    if (response?.type === 'CONNECTION_STATE') {
      const { state } = response;

      if (state.isConnected && state.selectedAddress) {
        statusIndicator.classList.add('connected');
        statusText.textContent = 'Connected';
        connectedAddress.textContent = state.selectedAddress;
        connectedAddress.classList.remove('hidden');
        disconnectBtn.classList.remove('hidden');
      } else {
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'Disconnected';
        connectedAddress.classList.add('hidden');
        disconnectBtn.classList.add('hidden');
      }
    }
  } catch (error) {
    console.error('Failed to get connection state:', error);
  }
}

/**
 * Handle save configuration
 */
async function handleSave() {
  const addressesText = addressesInput.value;
  const addresses = parseAddressList(addressesText);

  // Validate addresses
  const invalidAddresses = addresses.filter((addr) => !isValidAddress(addr));
  if (invalidAddresses.length > 0) {
    alert(`Invalid addresses:\n${invalidAddresses.join('\n')}`);
    return;
  }

  // Update config
  const newConfig: Partial<WalletConfig> = {
    addresses,
    chainId: chainSelect.value,
  };

  if (rpcInput.value.trim()) {
    newConfig.rpcUrl = rpcInput.value.trim();
  }

  try {
    await updateConfig(newConfig);

    // Show success notification
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('assets/icon-48.png'),
      title: 'ZeroConnectWallet',
      message: 'Configuration saved successfully!',
    });

    // Reload config
    currentConfig = await getConfig();
  } catch (error) {
    console.error('Failed to save config:', error);
    alert('Failed to save configuration');
  }
}

/**
 * Handle disconnect
 */
async function handleDisconnect() {
  // Clear last connected address
  await updateConfig({ lastConnectedAddress: null });

  // Send disconnect message to background
  await browser.runtime.sendMessage({
    type: 'UPDATE_CONFIG',
    config: { lastConnectedAddress: null },
  });

  // Update UI
  await updateConnectionStatus();

  // Show notification
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('assets/icon-48.png'),
    title: 'ZeroConnectWallet',
    message: 'Disconnected from dApp',
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
