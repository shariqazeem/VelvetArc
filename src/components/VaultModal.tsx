"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useUserPosition, useApprove, useDeposit, useWithdraw } from "@/hooks/useContracts";

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
}

export function VaultModal({ isOpen, onClose, mode }: VaultModalProps) {
  const { address, isConnected } = useAccount();
  const { usdcBalance, shares, allowanceRaw, refetch } = useUserPosition();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "approving" | "executing" | "success" | "error">("input");
  const [errorMessage, setErrorMessage] = useState("");

  // Hooks for transactions
  const {
    approve,
    isPending: isApproving,
    isSuccess: approveSuccess,
    error: approveError,
    reset: resetApprove,
  } = useApprove();

  const {
    deposit,
    isPending: isDepositing,
    isSuccess: depositSuccess,
    error: depositError,
    reset: resetDeposit,
  } = useDeposit();

  const {
    withdraw,
    isPending: isWithdrawing,
    isSuccess: withdrawSuccess,
    error: withdrawError,
    reset: resetWithdraw,
  } = useWithdraw();

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setStep("input");
      setErrorMessage("");
      resetApprove();
      resetDeposit();
      resetWithdraw();
    }
  }, [isOpen, resetApprove, resetDeposit, resetWithdraw]);

  // Handle approval success
  useEffect(() => {
    if (approveSuccess && step === "approving") {
      setStep("executing");
      refetch();
      // After approval, execute the deposit
      deposit(amount);
    }
  }, [approveSuccess, step, amount, deposit, refetch]);

  // Handle deposit/withdraw success
  useEffect(() => {
    if ((depositSuccess || withdrawSuccess) && step === "executing") {
      setStep("success");
      refetch();
    }
  }, [depositSuccess, withdrawSuccess, step, refetch]);

  // Handle errors
  useEffect(() => {
    const error = approveError || depositError || withdrawError;
    if (error) {
      setStep("error");
      setErrorMessage(error.message || "Transaction failed");
    }
  }, [approveError, depositError, withdrawError]);

  const maxAmount = mode === "deposit" ? usdcBalance : shares;

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setErrorMessage("");

    if (mode === "deposit") {
      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));
      const currentAllowance = allowanceRaw ?? BigInt(0);

      if (currentAllowance < amountWei) {
        // Need approval first
        setStep("approving");
        approve(amount);
      } else {
        // Already approved, deposit directly
        setStep("executing");
        deposit(amount);
      }
    } else {
      // Withdraw
      setStep("executing");
      withdraw(amount);
    }
  };

  const handleMax = () => {
    setAmount(maxAmount);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="glass inner-glow rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {mode === "deposit" ? "Deposit USDC" : "Withdraw"}
              </h2>
              <button
                onClick={onClose}
                className="text-ghost hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {step === "input" && (
              <>
                {/* Balance */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-ghost">
                      {mode === "deposit" ? "Available" : "Your Shares"}
                    </span>
                    <span className="text-whisper font-mono">
                      {parseFloat(maxAmount).toFixed(2)} {mode === "deposit" ? "USDC" : "shares"}
                    </span>
                  </div>

                  {/* Input */}
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-2xl font-mono focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <button
                      onClick={handleMax}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ghost hover:text-white transition-colors px-2 py-1 rounded bg-white/5"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-white/5 rounded-lg p-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-ghost">Network</span>
                    <span className="text-whisper">Arc Testnet</span>
                  </div>
                  {mode === "deposit" && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-ghost">You receive</span>
                      <span className="text-whisper font-mono">
                        ~{amount || "0"} shares
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(maxAmount)}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mode === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              </>
            )}

            {step === "approving" && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg mb-2">Approving USDC...</p>
                <p className="text-sm text-ghost">Please confirm in your wallet</p>
              </div>
            )}

            {step === "executing" && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg mb-2">
                  {mode === "deposit" ? "Depositing..." : "Withdrawing..."}
                </p>
                <p className="text-sm text-ghost">Please confirm in your wallet</p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg mb-2">Success!</p>
                <p className="text-sm text-ghost mb-6">
                  {mode === "deposit"
                    ? `Deposited ${amount} USDC into the vault`
                    : `Withdrew ${amount} shares from the vault`}
                </p>
                <button onClick={onClose} className="btn-ghost">
                  Close
                </button>
              </div>
            )}

            {step === "error" && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-lg mb-2">Transaction Failed</p>
                <p className="text-sm text-ghost mb-6 break-words">
                  {errorMessage.slice(0, 100)}
                </p>
                <button
                  onClick={() => {
                    setStep("input");
                    setErrorMessage("");
                    resetApprove();
                    resetDeposit();
                    resetWithdraw();
                  }}
                  className="btn-ghost"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
