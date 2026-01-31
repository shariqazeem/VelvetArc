"use client";

import { useReadContract, useReadContracts, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { CONTRACTS, VAULT_ABI, HOOK_ABI, ERC20_ABI, arcTestnet } from "@/lib/wagmi-config";
import { baseSepolia } from "wagmi/chains";

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
        functionName: "currentState",
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
        functionName: "getVaultBalance",
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

  const currentState = data?.[0]?.result as number | undefined;
  const totalDeposits = data?.[1]?.result as bigint | undefined;
  const vaultBalance = data?.[2]?.result as bigint | undefined;
  const totalShares = data?.[3]?.result as bigint | undefined;

  return {
    isLoading,
    refetch,
    currentState: currentState ?? 0,
    stateName: VaultState[currentState ?? 0] ?? "UNKNOWN",
    totalDeposits: totalDeposits ? formatUnits(totalDeposits, 6) : "0",
    vaultBalance: vaultBalance ? formatUnits(vaultBalance, 6) : "0",
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
        functionName: "totalVolume",
        chainId: baseSepolia.id,
      },
      {
        address: CONTRACTS.hook,
        abi: HOOK_ABI,
        functionName: "feesCollected",
        chainId: baseSepolia.id,
      },
    ],
  });

  const dynamicFee = data?.[0]?.result as number | undefined;
  const totalVolume = data?.[1]?.result as bigint | undefined;
  const feesCollected = data?.[2]?.result as bigint | undefined;

  return {
    isLoading,
    refetch,
    dynamicFee: dynamicFee ?? 3000,
    dynamicFeePercent: ((dynamicFee ?? 3000) / 10000).toFixed(2),
    totalVolume: totalVolume ? formatUnits(totalVolume, 6) : "0",
    feesCollected: feesCollected ? formatUnits(feesCollected, 6) : "0",
  };
}

export function useUserPosition() {
  const { address } = useAccount();

  const { data: shares, isLoading: sharesLoading } = useReadContract({
    address: CONTRACTS.vault,
    abi: VAULT_ABI,
    functionName: "shares",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: usdcBalance, isLoading: balanceLoading } = useReadContract({
    address: CONTRACTS.arcUsdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcTestnet.id,
    query: {
      enabled: !!address,
    },
  });

  return {
    isLoading: sharesLoading || balanceLoading,
    shares: shares ? formatUnits(shares, 6) : "0",
    usdcBalance: usdcBalance ? formatUnits(usdcBalance, 6) : "0",
  };
}

export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = async (amount: string) => {
    const amountWei = parseUnits(amount, 6);

    // First approve
    writeContract({
      address: CONTRACTS.arcUsdc,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.vault, amountWei],
      chainId: arcTestnet.id,
    });
  };

  const executeDeposit = async (amount: string) => {
    const amountWei = parseUnits(amount, 6);

    writeContract({
      address: CONTRACTS.vault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [amountWei],
      chainId: arcTestnet.id,
    });
  };

  return {
    deposit,
    executeDeposit,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = async (shareAmount: string) => {
    const amountWei = parseUnits(shareAmount, 6);

    writeContract({
      address: CONTRACTS.vault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [amountWei],
      chainId: arcTestnet.id,
    });
  };

  return {
    withdraw,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
