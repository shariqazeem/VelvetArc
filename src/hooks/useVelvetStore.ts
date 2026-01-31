import { create } from "zustand";
import {
  AgentLoopState,
  initializeAgentState,
  runAgentIteration,
} from "@/lib/agent-brain";

interface VelvetStore {
  // Wallet state
  isConnected: boolean;
  address: string | null;
  chainId: number | null;

  // Vault state (maps to on-chain VaultState enum)
  // 0=IDLE, 1=BRIDGING_OUT, 2=DEPLOYED, 3=BRIDGING_BACK, 4=PROTECTED
  vaultState: number;
  totalDeposits: string;
  userDeposit: string;
  userShares: string;

  // Agent state
  agentState: AgentLoopState;
  isAgentRunning: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setWallet: (address: string | null, chainId: number | null) => void;
  setVaultState: (state: number) => void;
  setDeposits: (total: string, user: string, shares: string) => void;
  syncVaultData: (totalDeposits: string, userShares: string) => void;
  startAgent: () => void;
  stopAgent: () => void;
  runAgentStep: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Map agent state to vault state for UI
function agentStateToVaultState(agentState: AgentLoopState): number {
  const { currentState, position } = agentState;

  switch (currentState) {
    case "BRIDGING_TO_BASE":
    case "AWAITING_BRIDGE":
      return 1; // BRIDGING_OUT

    case "DEPLOYING_LIQUIDITY":
    case "FARMING":
      return 2; // DEPLOYED

    case "WITHDRAWING":
    case "BRIDGING_TO_ARC":
      return 3; // BRIDGING_BACK

    case "CIRCUIT_BREAKER":
      return 4; // PROTECTED

    default:
      return position === "BASE" ? 2 : 0; // DEPLOYED or IDLE
  }
}

export const useVelvetStore = create<VelvetStore>((set, get) => ({
  // Initial state
  isConnected: false,
  address: null,
  chainId: null,
  vaultState: 0,
  totalDeposits: "0",
  userDeposit: "0",
  userShares: "0",
  agentState: initializeAgentState(1_000_000), // 1M USDC initial
  isAgentRunning: false,
  isLoading: false,
  error: null,

  // Actions
  setWallet: (address, chainId) =>
    set({
      isConnected: !!address,
      address,
      chainId,
    }),

  setVaultState: (state) => set({ vaultState: state }),

  setDeposits: (total, user, shares) =>
    set({
      totalDeposits: total,
      userDeposit: user,
      userShares: shares,
    }),

  startAgent: () => {
    const state = get();
    // Initialize with actual vault balance
    const vaultBalance = parseFloat(state.totalDeposits) * 1_000_000 || 1_000_000;
    set({
      isAgentRunning: true,
      agentState: {
        ...state.agentState,
        isRunning: true,
        vaultBalance,
      },
    });
  },

  // Sync vault data from on-chain
  syncVaultData: (totalDeposits: string, userShares: string) => {
    const state = get();
    const vaultBalance = parseFloat(totalDeposits) * 1_000_000 || 0;
    set({
      totalDeposits,
      userShares,
      agentState: {
        ...state.agentState,
        vaultBalance,
      },
    });
  },

  stopAgent: () => {
    const state = get();
    set({
      isAgentRunning: false,
      agentState: {
        ...state.agentState,
        isRunning: false,
        currentState: state.agentState.position === "ARC" ? "IDLE" : "FARMING",
      },
    });
  },

  runAgentStep: async () => {
    const state = get();
    if (!state.isAgentRunning) return;

    try {
      const newAgentState = await runAgentIteration(state.agentState);

      // Map agent state to vault state for UI
      const newVaultState = agentStateToVaultState(newAgentState);

      set({
        agentState: newAgentState,
        vaultState: newVaultState,
      });
    } catch (error) {
      console.error("Agent step failed:", error);
      set({
        error: error instanceof Error ? error.message : "Agent error",
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      isConnected: false,
      address: null,
      chainId: null,
      vaultState: 0,
      totalDeposits: "0",
      userDeposit: "0",
      userShares: "0",
      agentState: initializeAgentState(1_000_000),
      isAgentRunning: false,
      isLoading: false,
      error: null,
    }),
}));
