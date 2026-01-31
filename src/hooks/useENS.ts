"use client";

import { useEnsName, useEnsAddress, useEnsAvatar } from "wagmi";
import { mainnet } from "wagmi/chains";

/**
 * ENS Resolution Hooks for Velvet Arc
 *
 * These hooks ALWAYS query Ethereum Mainnet (Chain ID 1) for ENS resolution,
 * regardless of which chain the user is currently connected to.
 *
 * This is important because:
 * 1. ENS contracts live on Ethereum Mainnet
 * 2. Users may be on Base/Arc but still have an ENS name
 * 3. The Agent Identity panel should show ENS names for all users
 */

/**
 * Resolve ENS name to address
 * Always queries Ethereum Mainnet
 */
export function useENSAddress(name: string | undefined) {
  const { data: address, isLoading, error } = useEnsAddress({
    name: name,
    chainId: mainnet.id, // Always query mainnet
  });

  return {
    address: address ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to resolve ENS") : null,
  };
}

/**
 * Resolve address to ENS name (reverse lookup)
 * Always queries Ethereum Mainnet
 */
export function useENSName(address: string | undefined) {
  const { data: name, isLoading, error } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id, // Always query mainnet
  });

  return {
    name: name ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to resolve address") : null,
  };
}

/**
 * Get ENS avatar URL
 * Always queries Ethereum Mainnet
 */
export function useENSAvatar(name: string | undefined) {
  const { data: avatar, isLoading } = useEnsAvatar({
    name: name,
    chainId: mainnet.id, // Always query mainnet
  });

  return {
    avatar: avatar ?? null,
    isLoading,
  };
}

/**
 * Combined hook: Get ENS name and avatar for an address
 * Useful for the Agent Identity panel
 */
export function useENSIdentity(address: string | undefined) {
  const { name, isLoading: nameLoading, error: nameError } = useENSName(address);
  const { avatar, isLoading: avatarLoading } = useENSAvatar(name ?? undefined);

  return {
    name,
    avatar,
    isLoading: nameLoading || avatarLoading,
    error: nameError,
  };
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
