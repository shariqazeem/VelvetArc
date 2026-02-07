"use client";

import {
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createEIP712AuthMessageSigner,
  createECDSAMessageSigner,
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createTransferMessage,
  parseAnyRPCResponse,
  RPCProtocolVersion,
  type MessageSigner,
  type CreateAppSessionRequestParams,
  type TransferRequestParams,
} from "@erc7824/nitrolite";
import type { WalletClient, Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// Yellow Network ClearNode WebSocket endpoints
const CLEARNET_WS_URL = "wss://clearnet.yellow.com/ws";
const CLEARNET_SANDBOX_WS_URL = "wss://clearnet-sandbox.yellow.com/ws";

export type YellowClientStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "authenticated"
  | "session_active"
  | "error";

export interface YellowClientState {
  status: YellowClientStatus;
  address: Address | null;
  sessionId: string | null;
  channelId: string | null;
  error: string | null;
  logs: Array<{ timestamp: number; message: string; type: "info" | "success" | "error" | "tx" }>;
}

export interface TransferResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

type StateListener = (state: YellowClientState) => void;

class YellowClientImpl {
  private static instance: YellowClientImpl | null = null;

  private ws: WebSocket | null = null;
  private walletClient: WalletClient | null = null;
  private signer: MessageSigner | null = null; // ECDSA signer for post-auth operations
  private address: Address | null = null;

  // Session key for signing operations after authentication
  private sessionPrivateKey: Hex | null = null;
  private sessionKeyAddress: Address | null = null;

  private state: YellowClientState = {
    status: "disconnected",
    address: null,
    sessionId: null,
    channelId: null,
    error: null,
    logs: [],
  };

  private listeners: Set<StateListener> = new Set();
  private useSandbox: boolean = true; // Use sandbox for development

  private constructor() {}

  static getInstance(): YellowClientImpl {
    if (!YellowClientImpl.instance) {
      YellowClientImpl.instance = new YellowClientImpl();
    }
    return YellowClientImpl.instance;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(updates: Partial<YellowClientState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  private addLog(message: string, type: "info" | "success" | "error" | "tx" = "info") {
    const newLog = { timestamp: Date.now(), message, type };
    this.updateState({
      logs: [...this.state.logs.slice(-49), newLog],
    });
  }

  getState(): YellowClientState {
    return this.state;
  }

  // Store auth params for EIP-712 signing
  private authParams: {
    address: Address;
    session_key: Address;
    application: string;
    allowances: Array<{ asset: string; amount: string }>;
    expires_at: bigint;
    scope: string;
  } | null = null;

  /**
   * Set up the wallet connection using window.ethereum
   */
  async setupWallet(walletClient: WalletClient): Promise<boolean> {
    try {
      this.addLog("Setting up wallet connection...", "info");

      if (!walletClient.account?.address) {
        throw new Error("No account connected to wallet client");
      }

      this.walletClient = walletClient;
      this.address = walletClient.account.address as Address;

      // Generate a temporary session key for signing operations after auth
      this.sessionPrivateKey = generatePrivateKey();
      const sessionAccount = privateKeyToAccount(this.sessionPrivateKey);
      this.sessionKeyAddress = sessionAccount.address;

      // Create ECDSA signer for post-auth operations
      this.signer = createECDSAMessageSigner(this.sessionPrivateKey);

      this.updateState({
        address: this.address,
      });

      this.addLog(`Wallet connected: ${this.address.slice(0, 8)}...${this.address.slice(-6)}`, "success");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to setup wallet";
      this.addLog(error, "error");
      this.updateState({ error });
      return false;
    }
  }

  /**
   * Connect to the Yellow Network ClearNode WebSocket
   */
  async connect(): Promise<boolean> {
    if (!this.walletClient || !this.address) {
      this.addLog("Wallet not set up. Call setupWallet first.", "error");
      return false;
    }

    return new Promise((resolve) => {
      this.updateState({ status: "connecting" });
      this.addLog("Connecting to Yellow ClearNode...", "info");

      const wsUrl = this.useSandbox ? CLEARNET_SANDBOX_WS_URL : CLEARNET_WS_URL;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        this.addLog("WebSocket connected. Authenticating...", "info");
        this.updateState({ status: "connected" });
        await this.authenticate();
        resolve(true);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = () => {
        this.addLog("WebSocket error occurred", "error");
        this.updateState({ status: "error", error: "WebSocket connection error" });
        resolve(false);
      };

      this.ws.onclose = () => {
        this.addLog("WebSocket connection closed", "info");
        this.updateState({ status: "disconnected" });
      };
    });
  }

  /**
   * Authenticate with the ClearNode
   */
  private async authenticate(): Promise<void> {
    if (!this.walletClient || !this.address || !this.ws || !this.sessionKeyAddress) return;

    try {
      // Store auth params for EIP-712 signing later
      // Sandbox uses "ytest.usd" test tokens (from Yellow Network faucet)
      // Use the generated session key address for delegated signing
      this.authParams = {
        address: this.address,
        session_key: this.sessionKeyAddress, // Use generated session key
        application: "velvet-arc",
        allowances: [{ asset: "ytest.usd", amount: "1000000000" }], // 1000 ytest.usd allowance
        expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours
        scope: "console",
      };

      // Step 1: Send auth request
      const authRequest = await createAuthRequestMessage(this.authParams);

      this.addLog("Sending auth challenge request...", "info");
      this.sendMessage(authRequest, "auth_challenge");

    } catch (err) {
      const error = err instanceof Error ? err.message : "Authentication failed";
      this.addLog(error, "error");
      this.updateState({ status: "error", error });
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(data: string): Promise<void> {
    try {
      // Parse the raw JSON to extract the response array
      const rawResponse = JSON.parse(data);

      // Response format: { res: [requestId, method, result, timestamp], sig: [...] }
      const resArray = rawResponse.res || rawResponse.req;
      if (!resArray || !Array.isArray(resArray)) {
        this.addLog(`Unknown message format`, "info");
        return;
      }

      const method = resArray[1];
      const result = resArray[2];

      // Handle auth challenge response
      if (method === "auth_challenge" && this.walletClient && this.authParams && this.sessionKeyAddress) {
        // Extract challenge_message from result
        const challengeMessage = result?.challenge_message;
        if (!challengeMessage) {
          this.addLog("No challenge message in response", "error");
          return;
        }

        this.addLog("Received auth challenge, signing with EIP-712...", "info");

        try {
          // Create EIP-712 signer for authentication ONLY
          // Use the session key address we generated
          const eip712Signer = createEIP712AuthMessageSigner(
            this.walletClient,
            {
              session_key: this.sessionKeyAddress,
              allowances: this.authParams.allowances,
              expires_at: this.authParams.expires_at,
              scope: this.authParams.scope,
            },
            { name: this.authParams.application }
          );

          // Create auth verify message from the challenge
          // Note: We do NOT store eip712Signer as this.signer
          // this.signer remains the ECDSA session key signer for post-auth operations
          const verifyMessage = await createAuthVerifyMessageFromChallenge(
            eip712Signer,
            challengeMessage
          );
          this.sendMessage(verifyMessage, "auth_verify");
        } catch (signErr) {
          const signError = signErr instanceof Error ? signErr.message : "Signing failed";
          this.addLog(`Signing error: ${signError}`, "error");
        }
        return;
      }

      // Handle auth verify response (successful authentication)
      if (method === "auth_verify") {
        // Check if there's an error in the result
        if (result?.error) {
          this.addLog(`Auth failed: ${result.error}`, "error");
          this.updateState({ status: "error", error: result.error });
          return;
        }
        this.addLog("Authentication successful!", "success");
        this.updateState({ status: "authenticated" });
        return;
      }

      // Handle create_app_session response
      if (method === "create_app_session") {
        if (result?.app_session_id) {
          this.updateState({
            status: "session_active",
            sessionId: result.app_session_id,
          });
          this.addLog(`Session created: ${result.app_session_id.slice(0, 16)}...`, "success");
        }
        return;
      }

      // Handle transfer response
      if (method === "transfer") {
        this.addLog("Transfer completed with instant finality!", "tx");
        return;
      }

      // Handle errors
      if (method === "error" || result?.error) {
        this.addLog(`Error: ${result?.error || "Unknown error"}`, "error");
        return;
      }

      // Log other messages
      this.addLog(`Received: ${method || "unknown message"}`, "info");

    } catch (parseErr) {
      // Raw message handling for debugging
      this.addLog(`Message: ${data.slice(0, 80)}...`, "info");
    }
  }

  /**
   * Send a message through the WebSocket
   */
  private sendMessage(message: string, type: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      this.addLog(`Sent: ${type}`, "info");
    } else {
      this.addLog("WebSocket not connected", "error");
    }
  }

  /**
   * Create an app session with a partner
   */
  async createSession(partnerAddress: Address): Promise<boolean> {
    if (!this.signer || !this.address || this.state.status !== "authenticated") {
      this.addLog("Not authenticated. Connect and authenticate first.", "error");
      return false;
    }

    try {
      this.addLog(`Creating session with ${partnerAddress.slice(0, 8)}...`, "info");

      const params: CreateAppSessionRequestParams = {
        definition: {
          application: "velvet-arc",
          protocol: RPCProtocolVersion.NitroRPC_0_2,
          participants: [this.address, partnerAddress],
          weights: [100, 0],
          quorum: 100,
          challenge: 86400,
          nonce: Date.now(),
        },
        allocations: [
          {
            participant: this.address,
            asset: "ytest.usd", // Sandbox test token
            amount: "0",
          },
        ],
      };

      const message = await createAppSessionMessage(this.signer, params);
      this.sendMessage(message, "create_app_session");

      return true;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to create session";
      this.addLog(error, "error");
      return false;
    }
  }

  /**
   * Send a payment through the state channel with instant finality
   */
  async sendPayment(amount: string, recipient: Address): Promise<TransferResult> {
    if (!this.signer || !this.state.sessionId) {
      return { success: false, error: "No active session" };
    }

    try {
      // ytest.usd has 6 decimals like USDC
      const amountUnits = BigInt(Math.floor(parseFloat(amount) * 1e6));

      this.addLog(`Sending ${amount} ytest.usd to ${recipient.slice(0, 8)}... [INSTANT]`, "info");

      const params: TransferRequestParams = {
        destination: recipient,
        allocations: [
          {
            asset: "ytest.usd", // Sandbox test token
            amount: amountUnits.toString(),
          },
        ],
      };

      const message = await createTransferMessage(this.signer, params);
      this.sendMessage(message, "transfer");

      // State channel payments have instant finality
      this.addLog(`Payment of ${amount} ytest.usd sent with INSTANT FINALITY`, "tx");

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Payment failed";
      this.addLog(error, "error");
      return { success: false, error };
    }
  }

  /**
   * Close the current session
   */
  async closeSession(): Promise<void> {
    if (!this.signer || !this.state.sessionId) {
      this.addLog("No active session to close", "error");
      return;
    }

    try {
      const message = await createCloseAppSessionMessage(this.signer, {
        app_session_id: this.state.sessionId as Hex,
        allocations: [],
      });

      this.sendMessage(message, "close_app_session");
      this.updateState({ sessionId: null, status: "authenticated" });
      this.addLog("Session closed", "info");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to close session";
      this.addLog(error, "error");
    }
  }

  /**
   * Disconnect from the ClearNode
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState({
      status: "disconnected",
      sessionId: null,
      channelId: null,
    });
    this.addLog("Disconnected from Yellow Network", "info");
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.updateState({ logs: [] });
  }
}

// Export singleton instance getter
export const YellowClient = {
  getInstance: () => YellowClientImpl.getInstance(),
};

export type { YellowClientImpl };
