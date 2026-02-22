import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(4);
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function getTokenDecimals(paymentToken: string): number {
  // ETH uses 18 decimals, stablecoins (USDC/USDT) use 6
  if (!paymentToken || paymentToken === ZERO_ADDRESS) return 18;
  return 6;
}

export function getTokenSymbol(paymentToken: string): string {
  if (!paymentToken || paymentToken === ZERO_ADDRESS) return "ETH";
  // Import would create circular dep, so use inline lookup from env
  const usdtAddress = (process.env.NEXT_PUBLIC_USDT_ADDRESS || "").toLowerCase();
  const usdcAddress = (process.env.NEXT_PUBLIC_USDC_ADDRESS || "").toLowerCase();
  const addr = paymentToken.toLowerCase();
  if (usdtAddress && addr === usdtAddress) return "USDT";
  if (usdcAddress && addr === usdcAddress) return "USDC";
  return "TOKEN";
}

export function formatTokenAmount(amount: bigint, paymentToken: string): string {
  const decimals = getTokenDecimals(paymentToken);
  const value = Number(amount) / Math.pow(10, decimals);
  // Show more decimals for ETH, fewer for stablecoins
  return decimals === 18 ? value.toFixed(4) : value.toFixed(2);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}
