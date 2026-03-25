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
    if (syncResult.walletConfig) {
      return { ...DEFAULT_CONFIG, ...syncResult.walletConfig };
    }
  } catch {
    // Fall back to local storage if sync fails
  }

  try {
    const localResult = await browser.storage.local.get('walletConfig');
    if (localResult.walletConfig) {
      return { ...DEFAULT_CONFIG, ...localResult.walletConfig };
    }
  } catch {
    // Use defaults if both fail
  }

  return DEFAULT_CONFIG;
}

/**
 * Save wallet configuration to sync storage
 */
export async function saveConfig(config: WalletConfig): Promise<void> {
  try {
    await browser.storage.sync.set({ walletConfig: config });
  } catch {
    // Fall back to local storage
    await browser.storage.local.set({ walletConfig: config });
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
