"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletClient } from "wagmi";
import { YellowClient, type YellowClientState } from "@/lib/yellow/YellowClient";
import type { Address } from "viem";

interface YellowTerminalProps {
  className?: string;
}

export function YellowTerminal({ className = "" }: YellowTerminalProps) {
  const { data: walletClient } = useWalletClient();
  const [input, setInput] = useState("");
  const [state, setState] = useState<YellowClientState>({
    status: "disconnected",
    address: null,
    sessionId: null,
    channelId: null,
    error: null,
    logs: [],
  });

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const client = YellowClient.getInstance();

  // Subscribe to client state changes
  useEffect(() => {
    const unsubscribe = client.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [client]);

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [state.logs]);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "/connect":
        if (!walletClient) {
          addLocalLog("Wallet not connected. Connect your wallet first.", "error");
          return;
        }
        await client.setupWallet(walletClient);
        await client.connect();
        break;

      case "/session":
        if (args.length === 0) {
          addLocalLog("Usage: /session <partner_address>", "error");
          return;
        }
        const partnerAddr = args[0] as Address;
        if (!partnerAddr.startsWith("0x") || partnerAddr.length !== 42) {
          addLocalLog("Invalid address format", "error");
          return;
        }
        await client.createSession(partnerAddr);
        break;

      case "/pay":
        if (args.length < 2) {
          addLocalLog("Usage: /pay <amount> <recipient>", "error");
          return;
        }
        const amount = args[0];
        const recipient = args[1] as Address;
        const result = await client.sendPayment(amount, recipient);
        if (!result.success) {
          addLocalLog(result.error || "Payment failed", "error");
        }
        break;

      case "/close":
        await client.closeSession();
        break;

      case "/disconnect":
        client.disconnect();
        break;

      case "/clear":
        client.clearLogs();
        break;

      case "/help":
        addLocalLog("Available commands:", "info");
        addLocalLog("  /faucet           - Request test tokens (ytest.usd)", "info");
        addLocalLog("  /connect          - Connect wallet & authenticate", "info");
        addLocalLog("  /balance          - Check your unified balance", "info");
        addLocalLog("  /session <addr>   - Create app session with partner", "info");
        addLocalLog("  /pay <amt> <addr> - Send instant payment", "info");
        addLocalLog("  /close            - Close current session", "info");
        addLocalLog("  /disconnect       - Disconnect from Yellow Network", "info");
        addLocalLog("  /clear            - Clear terminal logs", "info");
        break;

      case "/faucet":
        if (!walletClient?.account?.address) {
          addLocalLog("Connect wallet first to request tokens", "error");
          return;
        }
        addLocalLog("Requesting test tokens from faucet...", "info");
        try {
          const faucetRes = await fetch("https://clearnet-sandbox.yellow.com/faucet/requestTokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userAddress: walletClient.account.address }),
          });
          if (faucetRes.ok) {
            const data = await faucetRes.json();
            addLocalLog(`Faucet success! Received ytest.usd tokens`, "success");
            addLocalLog(`Tokens are in your Unified Balance (off-chain)`, "info");
            if (data.amount) {
              addLocalLog(`Amount: ${data.amount} ytest.usd`, "success");
            }
          } else {
            const errText = await faucetRes.text();
            addLocalLog(`Faucet error: ${errText || faucetRes.statusText}`, "error");
          }
        } catch (err) {
          addLocalLog(`Faucet request failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
        }
        break;

      case "/balance":
        if (state.status !== "authenticated" && state.status !== "session_active") {
          addLocalLog("Connect first with /connect to check balance", "error");
          return;
        }
        addLocalLog("Fetching unified balance...", "info");
        // The balance comes via the 'bu' (balance update) notification after auth
        addLocalLog("Balance updates are pushed automatically after transactions", "info");
        addLocalLog("Use /faucet to get test tokens if needed", "info");
        break;

      case "/demo":
        // Demo sequence to showcase instant finality
        addLocalLog("Running demo sequence...", "info");
        if (walletClient) {
          await client.setupWallet(walletClient);
          await client.connect();
          addLocalLog("Demo: Wallet connected and authenticated", "success");
          addLocalLog("Demo: State channel ready for INSTANT payments", "success");
          addLocalLog("Demo: Use /faucet to get test tokens", "info");
        } else {
          addLocalLog("Connect wallet first to run demo", "error");
        }
        break;

      default:
        addLocalLog(`Unknown command: ${command}. Type /help for available commands.`, "error");
    }
  };

  const addLocalLog = (message: string, type: "info" | "success" | "error" | "tx") => {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs.slice(-49), { timestamp: Date.now(), message, type }],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  };

  const getStatusColor = () => {
    switch (state.status) {
      case "authenticated":
      case "session_active":
        return "bg-emerald-500";
      case "connected":
        return "bg-amber-500";
      case "connecting":
        return "bg-blue-500 animate-pulse";
      case "error":
        return "bg-red-500";
      default:
        return "bg-white/30";
    }
  };

  const getStatusLabel = () => {
    switch (state.status) {
      case "session_active":
        return "SESSION ACTIVE";
      case "authenticated":
        return "AUTHENTICATED";
      case "connected":
        return "CONNECTED";
      case "connecting":
        return "CONNECTING...";
      case "error":
        return "ERROR";
      default:
        return "DISCONNECTED";
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-emerald-400";
      case "error":
        return "text-red-400";
      case "tx":
        return "text-purple-400";
      default:
        return "text-white/60";
    }
  };

  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
              {getStatusLabel()}
            </span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-white/60">Yellow Network</span>
        </div>

        {state.sessionId && (
          <div className="text-[9px] font-mono text-white/30">
            Session: {state.sessionId.slice(0, 12)}...
          </div>
        )}
      </div>

      {/* Instant Finality Badge */}
      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-2 text-white/50">
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="text-[10px]">
            State Channel · Instant Finality · Zero Gas
          </span>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="h-[240px] overflow-y-auto p-4 font-mono text-xs space-y-1 bg-black/20"
        onClick={() => inputRef.current?.focus()}
      >
        {state.logs.length === 0 ? (
          <div className="text-white/30 text-center py-8">
            <p className="mb-2">Yellow Network Terminal</p>
            <p className="text-[10px]">Type /help for commands or /connect to start</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {state.logs.map((log, i) => (
              <motion.div
                key={`${log.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-2 ${getLogColor(log.type)}`}
              >
                <span className="text-white/20 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span className="break-all">{log.message}</span>
                {log.type === "tx" && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-yellow-400 shrink-0"
                  >
                    [INSTANT]
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-white/5">
        <div className="flex items-center gap-2 p-3">
          <span className="text-emerald-400 font-mono text-sm">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={walletClient ? "Type a command..." : "Connect wallet first..."}
            disabled={!walletClient}
            className="flex-1 bg-transparent text-sm font-mono text-white placeholder:text-white/20 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase transition-all disabled:opacity-30"
          >
            Run
          </button>
        </div>
      </form>

      {/* Quick Actions */}
      <div className="p-3 border-t border-white/5 flex gap-2">
        <button
          onClick={() => handleCommand("/faucet")}
          disabled={!walletClient}
          className="flex-1 py-2 rounded text-[10px] text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          Faucet
        </button>
        <button
          onClick={() => handleCommand("/connect")}
          disabled={!walletClient || state.status === "authenticated" || state.status === "session_active"}
          className="flex-1 py-2 rounded text-[10px] text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          Connect
        </button>
        <button
          onClick={() => handleCommand("/disconnect")}
          disabled={state.status === "disconnected"}
          className="flex-1 py-2 rounded text-[10px] text-white/50 hover:text-white/70 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-30"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
