const NETWORK_MODE = process.env.NEXT_PUBLIC_NETWORK_MODE || "testnet";

export const CONTRACTS = {
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "",
  SKILL_BADGES: process.env.NEXT_PUBLIC_SKILL_BADGES_ADDRESS || "",
  JOB_BADGES: process.env.NEXT_PUBLIC_JOB_BADGES_ADDRESS || "",
  ESCROW_PAYMENT: process.env.NEXT_PUBLIC_ESCROW_PAYMENT_ADDRESS || "",
  ESCROW_PAYMENT_TOKEN: process.env.NEXT_PUBLIC_ESCROW_PAYMENT_TOKEN_ADDRESS || "",
  DISPUTE_RESOLUTION: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS || "",
  CHAIN_ID: NETWORK_MODE === "mainnet" ? 42161 : 421614,
  NETWORK: NETWORK_MODE === "mainnet" ? "arbitrum" : "arbitrumSepolia",
};

export const isMainnet = NETWORK_MODE === "mainnet";
export const isTestnet = NETWORK_MODE === "testnet";

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  arbitrumSepolia: {
    chainId: "0x" + (421614).toString(16),
    chainName: "Arbitrum Sepolia",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  },
  arbitrum: {
    chainId: "0x" + (42161).toString(16),
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
};

export const ACTIVE_NETWORK_CONFIG = NETWORK_CONFIGS[CONTRACTS.NETWORK];
