/**
 * EIP-1193 Provider Types
 * https://eips.ethereum.org/EIPS/eip-1193
 */

export interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface ProviderError extends Error {
  code: number;
  data?: unknown;
}

export interface ProviderInfo {
  chainId: string;
}

export type ProviderEventType =
  | 'connect'
  | 'disconnect'
  | 'accountsChanged'
  | 'chainChanged'
  | 'message';

export type ProviderEventHandler =
  | ((info: ProviderInfo) => void)
  | ((error: ProviderError) => void)
  | ((accounts: string[]) => void)
  | ((chainId: string) => void)
  | ((message: unknown) => void);

/**
 * Wallet Configuration
 */
export interface WalletConfig {
  /** Static list of addresses to expose */
  addresses: string[];
  /** Current chain ID (hex string, e.g., '0x1' for mainnet) */
  chainId: string;
  /** RPC endpoint for read operations */
  rpcUrl: string;
  /** Display name */
  walletName: string;
  /** Last connected address (persisted via sync) */
  lastConnectedAddress: string | null;
}

/**
 * Connection State
 */
export interface ConnectionState {
  isConnected: boolean;
  selectedAddress: string | null;
  chainId: string;
}

/**
 * RPC Response Types
 */
export interface RpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
