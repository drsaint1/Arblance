import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/contexts/Web3Context";
import { SUPPORTED_TOKENS, getTokenAddress } from "@/config/tokens";
import { CONTRACTS } from "@/lib/contracts";
import { ERC20_ABI } from "@/contracts/erc20Abi";

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  icon: string;
  usdValue?: number;
}

export const useTokenBalances = () => {
  const { account, provider } = useWeb3();
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({});
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState<string>(CONTRACTS.NETWORK);

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const net = await provider.getNetwork();
        const networkMap: Record<number, string> = {
          1: "mainnet",
          42161: "arbitrum",
          421614: "arbitrumSepolia",
          11155111: "sepolia",
          137: "polygon",
          80001: "mumbai",
          31337: "localhost",
        };
        setNetwork(networkMap[Number(net.chainId)] || CONTRACTS.NETWORK);
      }
    };
    getNetwork();
  }, [provider]);

  const loadBalances = async () => {
    if (!account || !provider) return;

    setLoading(true);
    try {
      const newBalances: Record<string, TokenBalance> = {};

      // Get ETH balance
      const ethBalance = await provider.getBalance(account);
      newBalances.ETH = {
        symbol: "ETH",
        name: "Ethereum",
        balance: ethBalance.toString(),
        balanceFormatted: parseFloat(ethers.formatEther(ethBalance)).toFixed(4),
        decimals: 18,
        icon: SUPPORTED_TOKENS.ETH.icon || "⟠",
      };

      // Get token balances
      for (const [symbol, token] of Object.entries(SUPPORTED_TOKENS)) {
        if (symbol === "ETH") continue;

        const tokenAddress = getTokenAddress(symbol, network);
        if (!tokenAddress) continue;

        try {
          // Check if contract exists at this address before calling
          const code = await provider.getCode(tokenAddress);
          if (code === "0x" || code === "0x0") {
            // No contract deployed at this address on current network
            newBalances[symbol] = {
              symbol,
              name: token.name,
              balance: "0",
              balanceFormatted: "0.00",
              decimals: token.decimals,
              icon: token.icon || "",
            };
            continue;
          }

          const tokenContract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI,
            provider
          );

          const balance = await tokenContract.balanceOf(account);
          const decimals = token.decimals;
          const divisor = BigInt(10) ** BigInt(decimals);
          const balanceFormatted = (Number(balance) / Number(divisor)).toFixed(
            decimals === 18 ? 4 : 2
          );

          newBalances[symbol] = {
            symbol,
            name: token.name,
            balance: balance.toString(),
            balanceFormatted,
            decimals,
            icon: token.icon || "",
          };
        } catch (error) {
          console.error(`Error loading ${symbol} balance:`, error);
          // Set zero balance if error
          newBalances[symbol] = {
            symbol,
            name: token.name,
            balance: "0",
            balanceFormatted: "0.00",
            decimals: token.decimals,
            icon: token.icon || "",
          };
        }
      }

      setBalances(newBalances);
    } catch (error) {
      console.error("Error loading balances:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTokenBalance = (symbol: string): TokenBalance | null => {
    return balances[symbol] || null;
  };

  const hasBalance = (symbol: string, amount: string): boolean => {
    const balance = balances[symbol];
    if (!balance) return false;

    const token = SUPPORTED_TOKENS[symbol];
    if (!token) return false;

    try {
      const amountBigInt = ethers.parseUnits(amount, token.decimals);
      const balanceBigInt = BigInt(balance.balance);
      return balanceBigInt >= amountBigInt;
    } catch {
      return false;
    }
  };

  const approveToken = async (
    tokenSymbol: string,
    spender: string,
    amount: string
  ): Promise<boolean> => {
    if (!account || !provider) return false;

    const tokenAddress = getTokenAddress(tokenSymbol, network);
    if (!tokenAddress) return false;

    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

      const token = SUPPORTED_TOKENS[tokenSymbol];
      const amountBigInt = ethers.parseUnits(amount, token.decimals);

      const tx = await tokenContract.approve(spender, amountBigInt);
      await tx.wait();

      return true;
    } catch (error) {
      console.error("Error approving token:", error);
      return false;
    }
  };

  const checkAllowance = async (
    tokenSymbol: string,
    spender: string
  ): Promise<string> => {
    if (!account || !provider) return "0";

    const tokenAddress = getTokenAddress(tokenSymbol, network);
    if (!tokenAddress) return "0";

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        provider
      );

      const allowance = await tokenContract.allowance(account, spender);
      return allowance.toString();
    } catch (error) {
      console.error("Error checking allowance:", error);
      return "0";
    }
  };

  useEffect(() => {
    if (account && provider) {
      loadBalances();
      // Reload balances every 30 seconds
      const interval = setInterval(loadBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [account, provider, network]);

  return {
    balances,
    loading,
    network,
    loadBalances,
    getTokenBalance,
    hasBalance,
    approveToken,
    checkAllowance,
  };
};
