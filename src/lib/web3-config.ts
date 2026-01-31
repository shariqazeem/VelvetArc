import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { CHAINS } from "./constants";

// Define Arc Testnet chain
const arcTestnet = {
  id: CHAINS.ARC_TESTNET.id,
  name: CHAINS.ARC_TESTNET.name,
  nativeCurrency: CHAINS.ARC_TESTNET.nativeCurrency,
  rpcUrls: {
    default: { http: [CHAINS.ARC_TESTNET.rpc] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: CHAINS.ARC_TESTNET.explorer },
  },
  testnet: true,
} as const;

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: [arcTestnet, baseSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [arcTestnet.id]: http(CHAINS.ARC_TESTNET.rpc),
    [baseSepolia.id]: http(CHAINS.BASE_SEPOLIA.rpc),
  },
});

// Export chain for use in components
export { arcTestnet, baseSepolia };
