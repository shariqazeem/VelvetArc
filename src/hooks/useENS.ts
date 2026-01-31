"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { normalize } from "viem/ens";
import { mainnet } from "wagmi/chains";
import { createPublicClient, http } from "viem";

// ENS is on mainnet - create a dedicated client
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

/**
 * Resolve ENS name to address
 */
export function useENSAddress(name: string | undefined) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setAddress(null);
      return;
    }

    const resolve = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const normalizedName = normalize(name);
        const resolved = await ensClient.getEnsAddress({
          name: normalizedName,
        });
        setAddress(resolved);
      } catch (e) {
        console.error("[ENS] Resolution failed:", e);
        setError(e instanceof Error ? e.message : "Failed to resolve ENS");
        setAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, [name]);

  return { address, isLoading, error };
}

/**
 * Resolve address to ENS name (reverse lookup)
 */
export function useENSName(address: string | undefined) {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setName(null);
      return;
    }

    const resolve = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const resolved = await ensClient.getEnsName({
          address: address as `0x${string}`,
        });
        setName(resolved);
      } catch (e) {
        console.error("[ENS] Reverse lookup failed:", e);
        setError(e instanceof Error ? e.message : "Failed to resolve address");
        setName(null);
      } finally {
        setIsLoading(false);
      }
    };

    resolve();
  }, [address]);

  return { name, isLoading, error };
}

/**
 * Get ENS avatar URL
 */
export function useENSAvatar(name: string | undefined) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!name) {
      setAvatar(null);
      return;
    }

    const fetchAvatar = async () => {
      setIsLoading(true);

      try {
        const normalizedName = normalize(name);
        const avatarUrl = await ensClient.getEnsAvatar({
          name: normalizedName,
        });
        setAvatar(avatarUrl);
      } catch (e) {
        console.error("[ENS] Avatar fetch failed:", e);
        setAvatar(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatar();
  }, [name]);

  return { avatar, isLoading };
}

/**
 * Format address with ENS name or truncated hex
 */
export function formatAddressOrENS(
  address: string | undefined,
  ensName: string | null | undefined
): string {
  if (ensName) return ensName;
  if (!address) return "Unknown";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
