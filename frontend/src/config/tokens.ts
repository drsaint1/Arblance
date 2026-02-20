// Stablecoin configuration for different networks

import { isMainnet } from "@/lib/contracts";

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  icon?: string;
}

// Default mainnet addresses (used when env vars are not set)
const DEFAULT_MAINNET_USDT = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const DEFAULT_MAINNET_USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

const usdtAddress = process.env.NEXT_PUBLIC_USDT_ADDRESS || (isMainnet ? DEFAULT_MAINNET_USDT : "");
const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || (isMainnet ? DEFAULT_MAINNET_USDC : "");

const buildTokens = (): Record<string, TokenInfo> => {
  const tokens: Record<string, TokenInfo> = {
    ETH: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      icon: "⟠",
    },
  };

  if (usdtAddress) {
    tokens.USDT = {
      address: usdtAddress,
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      icon: "💵",
    };
  }

  if (usdcAddress) {
    tokens.USDC = {
      address: usdcAddress,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💲",
    };
  }

  return tokens;
};

export const SUPPORTED_TOKENS: Record<string, TokenInfo> = buildTokens();

// Backward compatibility alias
export const ARBITRUM_SEPOLIA_TOKENS = SUPPORTED_TOKENS;

// Get token address by symbol and network
export function getTokenAddress(symbol: string, network: string): string | null {
  const token = SUPPORTED_TOKENS[symbol];
  if (!token || token.address === "0x0000000000000000000000000000000000000000") {
    return null;
  }
  return token.address;
}

// Get tokens for current network
export function getTokensForNetwork(chainId: number): Record<string, TokenInfo> {
  return SUPPORTED_TOKENS;
}

// Get supported payment tokens
export function getSupportedPaymentTokens(chainId: number): TokenInfo[] {
  return Object.values(SUPPORTED_TOKENS);
}
