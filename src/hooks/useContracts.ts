"use client";

import { useReadContract, useReadContracts, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { CONTRACTS, VAULT_ABI, HOOK_ABI, ERC20_ABI, arcTestnet } from "@/lib/wagmi-config";
import { baseSepolia } from "wagmi/chains";
import { useState, useCallback } from "react";

// Vault state enum
export const VaultState: Record<number, string> = {
  0: "IDLE",
  1: "BRIDGING_OUT",
  2: "DEPLOYED",
  3: "BRIDGING_BACK",
  4: "PROTECTED",
};

export function useVaultData() {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.vault,
        abi: VAULT_ABI,
        functionName: "state",
        chainId: arcTestnet.id,
      },
      {
        address: CONTRACTS.vault,
        abi: VAULT_ABI,
        functionName: "totalDeposits",
        chainId: arcTestnet.id,
      },
      {
        address: CONTRACTS.vault,
        abi: VAULT_ABI,
        functionName: "totalShares",
        chainId: arcTestnet.id,
      },
    ],
  });

  // Get vault USDC balance separately
  const { data: vaultBalance } = useReadContract({
    address: CONTRACTS.arcUsdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [CONTRACTS.vault],
    chainId: arcTestnet.id,
  });

  const currentState = data?.[0]?.result as number | undefined;
  const totalDeposits = data?.[1]?.result as bigint | undefined;
  const totalShares = data?.[2]?.result as bigint | undefined;

  return {
    isLoading,
    refetch,
    currentState: currentState ?? 0,
    stateName: VaultState[currentState ?? 0] ?? "UNKNOWN",
    totalDeposits: totalDeposits ? formatUnits(totalDeposits, 6) : "0",
    vaultBalance: vaultBalance ? formatUnits(vaultBalance as bigint, 6) : "0",
    totalShares: totalShares ? formatUnits(totalShares, 6) : "0",
  };
}

export function useHookData() {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: CONTRACTS.hook,
        abi: HOOK_ABI,
        functionName: "dynamicFee",
        chainId: baseSepolia.id,
      },
      {
        address: CONTRACTS.hook,
        abi: HOOK_ABI,
        functionName: "totalLiquidity",
        chainId: baseSepolia.id,
      },
      {
        address: CONTRACTS.hook,
        abi: HOOK_ABI,
        functionName: "volatilityLevel",
        chainId: baseSepolia.id,
      },
    ],
  });

  const dynamicFee = data?.[0]?.result as number | undefined;
  const totalLiquidity = data?.[1]?.result as bigint | undefined;
  const volatilityLevel = data?.[2]?.result as number | undefined;

  const volatilityLabels = ["LOW", "MEDIUM", "HIGH", "EXTREME"];

  return {
    isLoading,
    refetch,
    dynamicFee: dynamicFee ?? 3000,
    dynamicFeePercent: ((dynamicFee ?? 3000) / 10000).toFixed(2),
    totalLiquidity: totalLiquidity ? formatUnits(totalLiquidity, 6) : "0",
    volatilityLevel: volatilityLevel ?? 0,
    volatilityLabel: volatilityLabels[volatilityLevel ?? 0] ?? "UNKNOWN",
  };
}

export function useUserPosition() {
  const { address } = useAccount();

  const { data: shares, isLoading: sharesLoading, refetch: refetchShares } = useReadContract({
    address: CONTRACTS.vault,
    abi: VAULT_ABI,
    functionName: "shares",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: usdcBalance, isLoading: balanceLoading, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.arcUsdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.arcUsdc,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.vault] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  const refetch = useCallback(() => {
    refetchShares();
    refetchBalance();
    refetchAllowance();
  }, [refetchShares, refetchBalance, refetchAllowance]);

  return {
    isLoading: sharesLoading || balanceLoading,
    shares: shares ? formatUnits(shares as bigint, 6) : "0",
    sharesRaw: shares as bigint | undefined,
    usdcBalance: usdcBalance ? formatUnits(usdcBalance as bigint, 6) : "0",
    usdcBalanceRaw: usdcBalance as bigint | undefined,
    allowance: allowance ? formatUnits(allowance as bigint, 6) : "0",
    allowanceRaw: allowance as bigint | undefined,
    refetch,
  };
}

// Approval hook for USDC
export function useApprove() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = useCallback(async (amount: string) => {
    const amountWei = parseUnits(amount, 6);

    writeContract({
      address: CONTRACTS.arcUsdc,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.vault, amountWei],
      chainId: arcTestnet.id,
    });
  }, [writeContract]);

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    reset,
  };
}

// Deposit hook with proper flow
export function useDeposit() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'done'>('idle');

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = useCallback(async (amount: string) => {
    const amountWei = parseUnits(amount, 6);
    setStep('depositing');

    writeContract({
      address: CONTRACTS.vault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [amountWei],
      chainId: arcTestnet.id,
    });
  }, [writeContract]);

  // Reset step when transaction completes
  if (isSuccess && step === 'depositing') {
    setStep('done');
  }

  const resetDeposit = useCallback(() => {
    reset();
    setStep('idle');
  }, [reset]);

  return {
    deposit,
    step,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    reset: resetDeposit,
  };
}

// Withdraw hook
export function useWithdraw() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = useCallback(async (shareAmount: string) => {
    const amountWei = parseUnits(shareAmount, 6);

    writeContract({
      address: CONTRACTS.vault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [amountWei],
      chainId: arcTestnet.id,
    });
  }, [writeContract]);

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
    reset,
  };
}

// Combined deposit flow hook (approve + deposit)
export function useDepositFlow() {
  const { address } = useAccount();
  const { allowanceRaw, refetch: refetchPosition } = useUserPosition();
  const { approve, isPending: isApproving, isSuccess: approveSuccess, reset: resetApprove } = useApprove();
  const { deposit, isPending: isDepositing, isSuccess: depositSuccess, reset: resetDeposit } = useDeposit();

  const [step, setStep] = useState<'idle' | 'checking' | 'approving' | 'depositing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const executeDeposit = useCallback(async (amount: string) => {
    if (!address) {
      setError("Please connect wallet");
      return;
    }

    setStep('checking');
    setError(null);

    const amountWei = parseUnits(amount, 6);
    const currentAllowance = allowanceRaw ?? BigInt(0);

    try {
      // Check if we need approval
      if (currentAllowance < amountWei) {
        setStep('approving');
        await approve(amount);
        // Wait for approval - this is handled by wagmi
      } else {
        setStep('depositing');
        await deposit(amount);
      }
    } catch (e) {
      setStep('error');
      setError(e instanceof Error ? e.message : "Transaction failed");
    }
  }, [address, allowanceRaw, approve, deposit]);

  // Handle approval success
  if (approveSuccess && step === 'approving') {
    setStep('depositing');
    refetchPosition();
  }

  // Handle deposit success
  if (depositSuccess && step === 'depositing') {
    setStep('done');
    refetchPosition();
  }

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    resetApprove();
    resetDeposit();
  }, [resetApprove, resetDeposit]);

  return {
    executeDeposit,
    step,
    isApproving,
    isDepositing,
    isSuccess: depositSuccess,
    error,
    reset,
  };
}
