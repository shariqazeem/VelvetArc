import { create } from "zustand";
import {
  AgentLoopState,
  AgentDecision,
  MarketConditions,
  ExecutionLog,
  initializeAgentState,
  runAgentIteration,
} from "@/lib/agent-brain";

// Demo mode steps
type DemoStep =
  | "IDLE"
  | "DEPOSIT"
  | "SCANNING"
  | "ANALYZING_LOW"
  | "DEPLOYING"
  | "BRIDGING"
  | "FARMING"
  | "ANALYZING_HIGH"
  | "RETREATING"
  | "RETURNING"
  | "COMPLETE";

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

  // Demo mode
  isDemoMode: boolean;
  demoStep: DemoStep;

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

  // Demo mode actions
  startDemo: () => void;
  stopDemo: () => void;
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

// Demo sequence configuration
const DEMO_SEQUENCE: { step: DemoStep; duration: number }[] = [
  { step: "DEPOSIT", duration: 2000 },
  { step: "SCANNING", duration: 2500 },
  { step: "ANALYZING_LOW", duration: 2000 },
  { step: "DEPLOYING", duration: 1500 },
  { step: "BRIDGING", duration: 3000 },
  { step: "FARMING", duration: 4000 },
  { step: "ANALYZING_HIGH", duration: 2000 },
  { step: "RETREATING", duration: 1500 },
  { step: "RETURNING", duration: 3000 },
  { step: "COMPLETE", duration: 3000 },
];

// Create demo state for each step
function createDemoState(step: DemoStep, baseState: AgentLoopState): {
  agentState: AgentLoopState;
  vaultState: number;
} {
  const timestamp = Date.now();

  switch (step) {
    case "DEPOSIT":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "IDLE",
          position: "ARC",
          vaultBalance: 10000_000000, // $10,000
          lastDecision: null,
          lastConditions: null,
          executionHistory: [{
            timestamp,
            action: "DEPOSIT",
            details: "User deposited 10,000 USDC",
            success: true,
          }],
        },
        vaultState: 0,
      };

    case "SCANNING":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "SCANNING",
          position: "ARC",
          vaultBalance: 10000_000000,
          lastConditions: {
            volatility: "LOW",
            volatilityIndex: 15,
            ethPrice: 3450,
            volume24h: 25000000,
            priceChange24h: 1.2,
            tvl: 50000000,
            gasPrice: 25,
            timestamp,
          },
          executionHistory: [{
            timestamp,
            action: "SCAN",
            details: "Scanning market conditions...",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 0,
      };

    case "ANALYZING_LOW":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "ANALYZING",
          position: "ARC",
          vaultBalance: 10000_000000,
          lastConditions: {
            volatility: "LOW",
            volatilityIndex: 15,
            ethPrice: 3450,
            volume24h: 25000000,
            priceChange24h: 1.2,
            tvl: 50000000,
            gasPrice: 25,
            timestamp,
          },
          lastDecision: {
            action: "DEPLOY",
            reason: "Low volatility (15) + high volume ($25M). Optimal deployment window.",
            confidence: 0.88,
            suggestedAmount: "7000000000",
            suggestedFee: 200,
          },
          executionHistory: [{
            timestamp,
            action: "DEPLOY",
            details: "Low volatility detected. Deploying 70% to Base.",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 0,
      };

    case "DEPLOYING":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "BRIDGING_TO_BASE",
          position: "ARC",
          vaultBalance: 10000_000000,
          lastDecision: {
            action: "DEPLOY",
            reason: "Low volatility (15) + high volume ($25M). Optimal deployment window.",
            confidence: 0.88,
            suggestedAmount: "7000000000",
            suggestedFee: 200,
          },
          executionHistory: [{
            timestamp,
            action: "BRIDGE",
            details: "LI.FI bridge initiated: Arc → Base",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 1,
      };

    case "BRIDGING":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "AWAITING_BRIDGE",
          position: "ARC",
          vaultBalance: 3000_000000, // 3k remaining on Arc
          deployedAmount: 7000_000000, // 7k deploying
          executionHistory: [{
            timestamp,
            action: "BRIDGE",
            details: "Circle Gateway: TX confirmed",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 1,
      };

    case "FARMING":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "FARMING",
          position: "BASE",
          vaultBalance: 3000_000000,
          deployedAmount: 7000_000000,
          totalYieldEarned: 35_000000, // $35 earned
          lastConditions: {
            volatility: "LOW",
            volatilityIndex: 18,
            ethPrice: 3480,
            volume24h: 28000000,
            priceChange24h: 2.1,
            tvl: 52000000,
            gasPrice: 22,
            timestamp,
          },
          lastDecision: {
            action: "ADJUST_FEE",
            reason: "Conditions stable. Continuing yield generation with optimized fee.",
            confidence: 0.85,
            suggestedFee: 200,
          },
          executionHistory: [{
            timestamp,
            action: "FARMING",
            details: "Uniswap V4 Hook active. Earning 0.02% fees.",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 2,
      };

    case "ANALYZING_HIGH":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "ANALYZING",
          position: "BASE",
          vaultBalance: 3000_000000,
          deployedAmount: 7050_000000, // Gained $50
          totalYieldEarned: 50_000000,
          lastConditions: {
            volatility: "HIGH",
            volatilityIndex: 72,
            ethPrice: 3280,
            volume24h: 45000000,
            priceChange24h: -4.8,
            tvl: 48000000,
            gasPrice: 65,
            timestamp,
          },
          lastDecision: {
            action: "WITHDRAW",
            reason: "High volatility detected (72). Returning to safe harbor.",
            confidence: 0.92,
          },
          executionHistory: [{
            timestamp,
            action: "ALERT",
            details: "High volatility spike detected! -4.8% in 24h",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 2,
      };

    case "RETREATING":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "BRIDGING_TO_ARC",
          position: "BASE",
          vaultBalance: 3000_000000,
          deployedAmount: 7050_000000,
          totalYieldEarned: 50_000000,
          lastDecision: {
            action: "WITHDRAW",
            reason: "High volatility detected (72). Returning to safe harbor.",
            confidence: 0.92,
          },
          executionHistory: [{
            timestamp,
            action: "WITHDRAW",
            details: "Emergency withdrawal initiated. Protecting capital.",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 3,
      };

    case "RETURNING":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "BRIDGING_TO_ARC",
          position: "BASE",
          vaultBalance: 3000_000000,
          deployedAmount: 7050_000000,
          totalYieldEarned: 50_000000,
          executionHistory: [{
            timestamp,
            action: "BRIDGE",
            details: "LI.FI bridge: Base → Arc. ETA 2 min.",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 3,
      };

    case "COMPLETE":
      return {
        agentState: {
          ...baseState,
          isRunning: true,
          currentState: "IDLE",
          position: "ARC",
          vaultBalance: 10050_000000, // Original + $50 yield
          deployedAmount: 0,
          totalYieldEarned: 50_000000,
          lastConditions: {
            volatility: "HIGH",
            volatilityIndex: 68,
            ethPrice: 3250,
            volume24h: 42000000,
            priceChange24h: -5.2,
            tvl: 47000000,
            gasPrice: 70,
            timestamp,
          },
          lastDecision: {
            action: "HOLD",
            reason: "Safe harbor. Capital protected. +$50 yield captured.",
            confidence: 0.95,
          },
          executionHistory: [{
            timestamp,
            action: "COMPLETE",
            details: "Capital safe on Arc. Total yield: +$50 (+0.5%)",
            success: true,
          }, ...baseState.executionHistory],
        },
        vaultState: 0,
      };

    default:
      return {
        agentState: baseState,
        vaultState: 0,
      };
  }
}

export const useVelvetStore = create<VelvetStore>((set, get) => {
  let demoTimeoutId: NodeJS.Timeout | null = null;
  let demoStepIndex = 0;

  const runDemoSequence = () => {
    const state = get();
    if (!state.isDemoMode) return;

    if (demoStepIndex >= DEMO_SEQUENCE.length) {
      // Demo complete, restart after delay
      demoStepIndex = 0;
      demoTimeoutId = setTimeout(runDemoSequence, 3000);
      return;
    }

    const { step, duration } = DEMO_SEQUENCE[demoStepIndex];
    const { agentState: newAgentState, vaultState: newVaultState } = createDemoState(
      step,
      state.agentState
    );

    set({
      demoStep: step,
      agentState: newAgentState,
      vaultState: newVaultState,
      totalDeposits: (newAgentState.vaultBalance / 1_000_000).toString(),
    });

    demoStepIndex++;
    demoTimeoutId = setTimeout(runDemoSequence, duration);
  };

  return {
    // Initial state
    isConnected: false,
    address: null,
    chainId: null,
    vaultState: 0,
    totalDeposits: "0",
    userDeposit: "0",
    userShares: "0",
    agentState: initializeAgentState(1_000_000),
    isAgentRunning: false,
    isDemoMode: false,
    demoStep: "IDLE",
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
      if (state.isDemoMode) return; // Don't sync during demo
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
      if (!state.isAgentRunning || state.isDemoMode) return;

      try {
        const newAgentState = await runAgentIteration(state.agentState);
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

    reset: () => {
      if (demoTimeoutId) {
        clearTimeout(demoTimeoutId);
        demoTimeoutId = null;
      }
      demoStepIndex = 0;
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
        isDemoMode: false,
        demoStep: "IDLE",
        isLoading: false,
        error: null,
      });
    },

    // Demo mode actions
    startDemo: () => {
      if (demoTimeoutId) {
        clearTimeout(demoTimeoutId);
      }
      demoStepIndex = 0;

      set({
        isDemoMode: true,
        isAgentRunning: true,
        demoStep: "IDLE",
        totalDeposits: "0",
        vaultState: 0,
      });

      // Start demo sequence after brief delay
      demoTimeoutId = setTimeout(runDemoSequence, 500);
    },

    stopDemo: () => {
      if (demoTimeoutId) {
        clearTimeout(demoTimeoutId);
        demoTimeoutId = null;
      }
      demoStepIndex = 0;

      set({
        isDemoMode: false,
        isAgentRunning: false,
        demoStep: "IDLE",
        agentState: initializeAgentState(1_000_000),
        vaultState: 0,
        totalDeposits: "0",
      });
    },
  };
});
