import type { WalletConfig } from './types';

const DEFAULT_CONFIG: WalletConfig = {
  addresses: [],
  chainId: '0x1', // Ethereum mainnet
  rpcUrl: 'https://eth.llamarpc.com',
  walletName: 'ZeroConnectWallet',
  lastConnectedAddress: null,
};

/**
 * Get wallet configuration from sync storage
 */
export async function getConfig(): Promise<WalletConfig> {
  try {
    // Try sync storage first
    const syncResult = await browser.storage.sync.get('walletConfig');
    console.log('Config: Sync storage result:', syncResult);
    if (syncResult.walletConfig) {
      console.log('Config: Using sync storage');
      return { ...DEFAULT_CONFIG, ...syncResult.walletConfig };
    }
  } catch (error) {
    console.warn('Config: Sync storage failed:', error);
    // Fall back to local storage if sync fails
  }

  try {
    const localResult = await browser.storage.local.get('walletConfig');
    console.log('Config: Local storage result:', localResult);
    if (localResult.walletConfig) {
      console.log('Config: Using local storage');
      return { ...DEFAULT_CONFIG, ...localResult.walletConfig };
    }
  } catch (error) {
    console.error('Config: Local storage failed:', error);
    // Use defaults if both fail
  }

  console.log('Config: Using default config');
  return DEFAULT_CONFIG;
}

/**
 * Save wallet configuration to sync storage
 */
export async function saveConfig(config: WalletConfig): Promise<void> {
  try {
    await browser.storage.sync.set({ walletConfig: config });
    console.log('Config: Saved to sync storage');
  } catch (error) {
    console.warn('Config: Failed to save to sync, falling back to local:', error);
    // Fall back to local storage
    await browser.storage.local.set({ walletConfig: config });
    console.log('Config: Saved to local storage');
  }
}

/**
 * Update specific configuration fields
 */
export async function updateConfig(
  updates: Partial<WalletConfig>
): Promise<WalletConfig> {
  const currentConfig = await getConfig();
  const newConfig = { ...currentConfig, ...updates };
  await saveConfig(newConfig);
  return newConfig;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Parse comma-separated address list
 */
export function parseAddressList(addresses: string): string[] {
  return addresses
    .split(/[\n,]/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0)
    .filter(isValidAddress);
}
