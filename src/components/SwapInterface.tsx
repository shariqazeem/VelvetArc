"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";
import { CONTRACTS, ERC20_ABI, HOOK_ABI, POOL_SWAP_TEST_ABI, VELVET_POOL_KEY } from "@/lib/wagmi-config";
import { motion } from "framer-motion";

interface SwapInterfaceProps {
  onSwapComplete?: (txHash: string, feeApplied: number) => void;
}

export function SwapInterface({ onSwapComplete }: SwapInterfaceProps) {
  const { address, isConnected } = useAccount();
  const [swapDirection, setSwapDirection] = useState<"ethToUsdc" | "usdcToEth">("ethToUsdc");
  const [inputAmount, setInputAmount] = useState("");
  const [estimatedOutput, setEstimatedOutput] = useState("0");
  const [currentFee, setCurrentFee] = useState(0);
  const [swapStatus, setSwapStatus] = useState<"idle" | "approving" | "swapping" | "success" | "error">("idle");

  // Read current dynamic fee from hook
  const { data: hookStatus } = useReadContract({
    address: CONTRACTS.hook,
    abi: HOOK_ABI,
    functionName: "getHookStatus",
    chainId: baseSepolia.id,
  });

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.baseUsdc,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: baseSepolia.id,
  });

  // Contract write
  const { writeContract, data: txHash, isPending, error: txError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Update current fee from hook
  useEffect(() => {
    if (hookStatus) {
      const [fee] = hookStatus as [number, number, bigint, bigint, string];
      setCurrentFee(fee);
    }
  }, [hookStatus]);

  // Calculate estimated output based on input and fee
  useEffect(() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setEstimatedOutput("0");
      return;
    }

    const amount = parseFloat(inputAmount);
    const feePercent = currentFee / 10000; // Convert basis points to percentage

    if (swapDirection === "ethToUsdc") {
      // ETH to USDC: assume ~$2500/ETH
      const usdcOut = amount * 2500 * (1 - feePercent);
      setEstimatedOutput(usdcOut.toFixed(2));
    } else {
      // USDC to ETH: assume ~$2500/ETH
      const ethOut = (amount / 2500) * (1 - feePercent);
      setEstimatedOutput(ethOut.toFixed(6));
    }
  }, [inputAmount, swapDirection, currentFee]);

  // Handle swap confirmation
  useEffect(() => {
    if (isConfirmed && swapStatus === "swapping") {
      setSwapStatus("success");
      onSwapComplete?.(txHash!, currentFee);
      setTimeout(() => {
        setSwapStatus("idle");
        setInputAmount("");
        reset();
      }, 3000);
    }
  }, [isConfirmed, swapStatus, txHash, currentFee, onSwapComplete, reset]);

  // Handle errors
  useEffect(() => {
    if (txError) {
      setSwapStatus("error");
      setTimeout(() => {
        setSwapStatus("idle");
        reset();
      }, 3000);
    }
  }, [txError, reset]);

  const handleSwap = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;

    setSwapStatus("swapping");

    // Build swap params
    const zeroForOne = swapDirection === "usdcToEth"; // USDC is currency0
    const amountSpecified = swapDirection === "ethToUsdc"
      ? parseUnits(inputAmount, 18) // ETH has 18 decimals
      : parseUnits(inputAmount, 6);  // USDC has 6 decimals

    // For exact input swaps, amountSpecified should be negative
    const swapParams = {
      zeroForOne,
      amountSpecified: -BigInt(amountSpecified.toString()),
      sqrtPriceLimitX96: BigInt(0), // No price limit
    };

    const testSettings = {
      takeClaims: false,
      settleUsingBurn: false,
    };

    try {
      writeContract({
        address: CONTRACTS.poolSwapTest,
        abi: POOL_SWAP_TEST_ABI,
        functionName: "swap",
        args: [
          VELVET_POOL_KEY,
          swapParams,
          testSettings,
          "0x", // Empty hook data
        ],
        chainId: baseSepolia.id,
        value: swapDirection === "ethToUsdc" ? amountSpecified : BigInt(0),
      });
    } catch (e) {
      console.error("Swap error:", e);
      setSwapStatus("error");
    }
  };

  const feeDisplay = (currentFee / 100).toFixed(2);
  const feeAmount = inputAmount ? (parseFloat(inputAmount) * currentFee / 10000).toFixed(swapDirection === "ethToUsdc" ? 6 : 2) : "0";

  return (
    <div className="space-y-4">
      {/* Swap Direction Toggle */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setSwapDirection("ethToUsdc")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
            swapDirection === "ethToUsdc"
              ? "bg-white text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          ETH → USDC
        </button>
        <button
          onClick={() => setSwapDirection("usdcToEth")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
            swapDirection === "usdcToEth"
              ? "bg-white text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          USDC → ETH
        </button>
      </div>

      {/* Input */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/50">You pay</span>
          {isConnected && swapDirection === "usdcToEth" && usdcBalance && (
            <span className="text-[10px] text-white/40">
              Balance: {parseFloat(formatUnits(usdcBalance as bigint, 6)).toFixed(2)} USDC
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-mono focus:outline-none"
          />
          <div className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-medium">
            {swapDirection === "ethToUsdc" ? "ETH" : "USDC"}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
          ↓
        </div>
      </div>

      {/* Output */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/50">You receive (estimated)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-2xl font-mono text-white/80">
            {estimatedOutput}
          </span>
          <div className="px-3 py-1.5 rounded-lg bg-white/10 text-sm font-medium">
            {swapDirection === "ethToUsdc" ? "USDC" : "ETH"}
          </div>
        </div>
      </div>

      {/* Fee Info */}
      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">⚡</span>
            <span className="text-xs text-white/70">Dynamic Fee (AI-controlled)</span>
          </div>
          <span className="text-sm font-mono text-purple-400">{feeDisplay}%</span>
        </div>
        {inputAmount && parseFloat(inputAmount) > 0 && (
          <div className="mt-2 pt-2 border-t border-purple-500/20 flex justify-between text-[10px]">
            <span className="text-white/50">Fee amount</span>
            <span className="text-white/70">
              ~{feeAmount} {swapDirection === "ethToUsdc" ? "ETH" : "USDC"}
            </span>
          </div>
        )}
      </div>

      {/* Swap Button */}
      {isConnected ? (
        <motion.button
          onClick={handleSwap}
          disabled={!inputAmount || parseFloat(inputAmount) <= 0 || swapStatus !== "idle"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
            swapStatus === "success"
              ? "bg-emerald-500 text-white"
              : swapStatus === "error"
              ? "bg-red-500 text-white"
              : swapStatus !== "idle"
              ? "bg-purple-500/50 text-white cursor-wait"
              : !inputAmount || parseFloat(inputAmount) <= 0
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          }`}
        >
          {swapStatus === "success" ? (
            <span className="flex items-center justify-center gap-2">
              <span>✓</span> Swap Complete
            </span>
          ) : swapStatus === "error" ? (
            "Swap Failed"
          ) : swapStatus === "swapping" || isPending || isConfirming ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">◐</span>
              {isPending ? "Confirm in wallet..." : "Processing..."}
            </span>
          ) : (
            "Swap"
          )}
        </motion.button>
      ) : (
        <div className="w-full py-4 rounded-xl bg-white/5 text-center text-white/40 text-sm">
          Connect wallet to swap
        </div>
      )}

      {/* Info */}
      <div className="text-[10px] text-white/30 text-center space-y-1">
        <p>Swaps execute through Uniswap V4 with VelvetHook</p>
        <p>Fee adjusts automatically based on market volatility</p>
      </div>
    </div>
  );
}

/**
 * Compact swap stats for dashboard display
 */
export function SwapStats() {
  const { data: hookStatus } = useReadContract({
    address: CONTRACTS.hook,
    abi: HOOK_ABI,
    functionName: "getHookStatus",
    chainId: baseSepolia.id,
  });

  const currentFee = hookStatus ? Number((hookStatus as readonly [number, number, bigint, bigint, string])[0]) / 100 : 0.3;

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-purple-400">⚡</span>
      <span className="text-white/60">Current swap fee:</span>
      <span className="font-mono text-purple-400">{currentFee.toFixed(2)}%</span>
    </div>
  );
}
