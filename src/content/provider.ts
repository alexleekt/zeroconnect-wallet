import type {
  ProviderError,
  ProviderEventHandler,
  ProviderEventType,
  ProviderInfo,
  RequestArguments,
} from '../shared/types';

/**
 * Message sender for injected script context
 * Uses postMessage to communicate with content script
 */
function sendToBackground(message: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).substring(7);
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResponse = (event: MessageEvent) => {
      if (event.source !== window) return;

      const data = event.data;
      // Only handle ZEROCONNECT_RESPONSE messages with matching requestId
      if (data?.type === 'ZEROCONNECT_RESPONSE' && data?.requestId === requestId) {
        window.removeEventListener('message', handleResponse);
        clearTimeout(timeoutId);
        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.payload);
        }
      }
    };

    window.addEventListener('message', handleResponse);

    // Send message to content script
    console.log('Provider: Sending message:', message);
    window.postMessage(
      {
        type: 'ZEROCONNECT_REQUEST',
        payload: message,
        requestId,
      },
      '*',
    );

    // Timeout after 30 seconds
    timeoutId = setTimeout(() => {
      window.removeEventListener('message', handleResponse);
      reject(new Error('Request timeout'));
    }, 30000);
  });
}

/**
 * EIP-1193 Provider Implementation
 * Mimics MetaMask's window.ethereum provider
 */
export class EthereumProvider {
  private eventHandlers: Map<ProviderEventType, Set<ProviderEventHandler>> = new Map();
  private _isConnected = false;
  private _selectedAddress: string | null = null;
  private _chainId = '0x1';
  private _networkVersion = '1';

  // MetaMask-specific properties
  public readonly isMetaMask = true;
  public selectedAddress: string | null = null;
  public chainId = '0x1';
  public networkVersion = '1';

  constructor() {
    // Initialize event handler sets
    this.eventHandlers.set('connect', new Set());
    this.eventHandlers.set('disconnect', new Set());
    this.eventHandlers.set('accountsChanged', new Set());
    this.eventHandlers.set('chainChanged', new Set());
    this.eventHandlers.set('message', new Set());
  }

  /**
   * Main request method (EIP-1193)
   */
  async request(args: RequestArguments): Promise<unknown> {
    const { method, params = [] } = args;
    // Normalize params to always be an array
    const normalizedParams: unknown[] = Array.isArray(params)
      ? [...params]
      : params
        ? [params]
        : [];

    switch (method) {
      case 'eth_requestAccounts':
        return this.requestAccounts();

      case 'eth_accounts':
        return this.getAccounts();

      case 'eth_chainId':
        return this._chainId;

      case 'eth_sendTransaction':
      case 'eth_sign':
      case 'personal_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v1':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return this.rejectSigningRequest(method);

      case 'wallet_switchEthereumChain':
        return this.switchChain(normalizedParams);

      case 'wallet_addEthereumChain':
        return this.addChain(normalizedParams);

      case 'wallet_getPermissions':
        return [];

      case 'wallet_requestPermissions':
        return [{ parentCapability: 'eth_accounts' }];

      default:
        // Pass through read-only RPC calls
        return this.forwardRpcCall(method, normalizedParams);
    }
  }

  /**
   * Request accounts (eth_requestAccounts)
   * Fetches address from user configuration via background script
   */
  private async requestAccounts(): Promise<string[]> {
    console.log('ZeroConnectWallet: Requesting accounts from config...');

    try {
      console.log('Provider: About to send CONNECT_REQUEST...');
      const rawResponse = await sendToBackground({
        type: 'CONNECT_REQUEST',
      });
      console.log('Provider: Raw response from sendToBackground:', JSON.stringify(rawResponse));

      const response = rawResponse as { type: string; selectedAddress?: string };

      if (response?.type === 'CONNECTION_APPROVED' && response.selectedAddress) {
        const address = response.selectedAddress;
        console.log('ZeroConnectWallet: Connected with address:', address);

        this._selectedAddress = address;
        this.selectedAddress = address;
        this._isConnected = true;

        // Emit events
        this.emit('connect', { chainId: this._chainId });
        this.emit('accountsChanged', [address]);

        return [address];
      } else if (response.type === 'CONNECTION_REJECTED') {
        throw this.createError(
          4001,
          'ZeroConnectWallet: No addresses configured. Please add an address in the extension settings.',
        );
      } else {
        throw this.createError(
          -32603,
          'ZeroConnectWallet: Unexpected response from background script.',
        );
      }
    } catch (error) {
      // If it's already a ProviderError, re-throw it
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      // Otherwise, wrap it
      throw this.createError(
        -32603,
        `ZeroConnectWallet: Failed to request accounts. ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get current accounts (eth_accounts)
   */
  private getAccounts(): string[] {
    if (this._isConnected && this._selectedAddress) {
      return [this._selectedAddress];
    }
    return [];
  }

  /**
   * Reject signing/transactions requests (read-only wallet)
   */
  private rejectSigningRequest(method: string): Promise<never> {
    // Send notification request
    sendToBackground({
      type: 'SHOW_REJECTION_NOTIFICATION',
      method,
    }).catch(() => {
      // Ignore errors for notifications
    });

    throw this.createError(
      4001,
      `ZeroConnectWallet is read-only. Cannot ${method}. Use your actual wallet to sign transactions.`,
    );
  }

  /**
   * Switch to a different chain
   */
  private async switchChain(params: unknown[]): Promise<null> {
    const [{ chainId }] = params as [{ chainId: string }];

    await sendToBackground({
      type: 'UPDATE_CONFIG',
      config: { chainId },
    });

    this._chainId = chainId;
    this.chainId = chainId;
    this._networkVersion = Number.parseInt(chainId, 16).toString();
    this.networkVersion = this._networkVersion;

    this.emit('chainChanged', chainId);

    return null;
  }

  /**
   * Add a new chain (simplified - just updates config)
   */
  private async addChain(params: unknown[]): Promise<null> {
    const [{ chainId }] = params as [{ chainId: string }];
    return this.switchChain([{ chainId }]);
  }

  /**
   * Forward RPC calls to configured endpoint
   */
  private async forwardRpcCall(method: string, params: unknown[]): Promise<unknown> {
    const response = (await sendToBackground({
      type: 'RPC_REQUEST',
      method,
      params,
    })) as {
      type: string;
      result?: unknown;
      error?: { code: number; message: string };
    };

    if (response?.type === 'RPC_RESPONSE') {
      if (response.error) {
        throw this.createError(response.error.code, response.error.message);
      }
      return response.result;
    }

    throw this.createError(-32603, 'Internal error');
  }

  /**
   * Event listener methods
   */
  on(event: ProviderEventType, handler: ProviderEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }
  }

  removeListener(event: ProviderEventType, handler: ProviderEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: ProviderEventType, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as (data: unknown) => void)(data);
        } catch (e) {
          console.error('Error in event handler:', e);
        }
      });
    }
  }

  /**
   * Create provider error
   */
  private createError(code: number, message: string): ProviderError {
    const error = new Error(message) as ProviderError;
    error.code = code;
    return error;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Enable (legacy MetaMask method)
   */
  async enable(): Promise<string[]> {
    return this.requestAccounts();
  }

  /**
   * Send (legacy method)
   */
  send(method: string, params?: unknown[]): Promise<unknown>;
  send(payload: object): Promise<unknown>;
  async send(methodOrPayload: string | object, params?: unknown[]): Promise<unknown> {
    if (typeof methodOrPayload === 'string') {
      return this.request({ method: methodOrPayload, params });
    }
    const payload = methodOrPayload as { method: string; params?: unknown[] };
    return this.request({ method: payload.method, params: payload.params });
  }
}
