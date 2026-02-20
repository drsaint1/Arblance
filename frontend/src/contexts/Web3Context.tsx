import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CONTRACTS, ACTIVE_NETWORK_CONFIG } from "@/lib/contracts";
import { FreelanceMarketplaceABI } from "@/lib/abis/FreelanceMarketplace";
import { SkillBadgesABI } from "@/lib/abis/SkillBadges";
import { JobBadgesABI } from "@/lib/abis/JobBadges";
import { UsernameSetupModal } from "@/components/UsernameSetupModal";
import toast from "react-hot-toast";

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  signer: any | null;
  marketplaceContract: Contract | null;
  skillBadgesContract: Contract | null;
  jobBadgesContract: Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  marketplaceContract: null,
  skillBadgesContract: null,
  jobBadgesContract: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [marketplaceContract, setMarketplaceContract] =
    useState<Contract | null>(null);
  const [skillBadgesContract, setSkillBadgesContract] =
    useState<Contract | null>(null);
  const [jobBadgesContract, setJobBadgesContract] = useState<Contract | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const switchToRequiredNetwork = async () => {
    const config = ACTIVE_NETWORK_CONFIG;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added to wallet yet — add it
      // MetaMask returns 4902, but other wallets may return -32603 or other codes
      if (switchError.code === 4902 || switchError.code === -32603 || switchError?.data?.originalError) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: config.chainId,
              chainName: config.chainName,
              nativeCurrency: config.nativeCurrency,
              rpcUrls: config.rpcUrls,
              blockExplorerUrls: config.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Ensure we're on the correct network
      await switchToRequiredNetwork();

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);

      // Initialize contracts
      const marketplace = new Contract(
        CONTRACTS.MARKETPLACE,
        FreelanceMarketplaceABI,
        signer
      );
      const skillBadges = new Contract(
        CONTRACTS.SKILL_BADGES,
        SkillBadgesABI,
        signer
      );
      const jobBadges = new Contract(
        CONTRACTS.JOB_BADGES,
        JobBadgesABI,
        signer
      );

      setMarketplaceContract(marketplace);
      setSkillBadgesContract(skillBadges);
      setJobBadgesContract(jobBadges);

      // Save to localStorage
      localStorage.setItem("walletConnected", "true");

      // Check if user has completed username setup
      const usernameSetupStatus = localStorage.getItem(`username_setup_${accounts[0]}`);
      if (!usernameSetupStatus || usernameSetupStatus === "false") {
        // Show username setup modal for first-time users
        setShowUsernameModal(true);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setMarketplaceContract(null);
    setSkillBadgesContract(null);
    setJobBadgesContract(null);
    localStorage.removeItem("walletConnected");
  };

  useEffect(() => {
    // Auto-connect if previously connected
    const wasConnected = localStorage.getItem("walletConnected");
    if (wasConnected === "true") {
      connectWallet();
    }

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUsernameSetupComplete = () => {
    setShowUsernameModal(false);
  };

  const handleUsernameSetupSkip = () => {
    setShowUsernameModal(false);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        marketplaceContract,
        skillBadgesContract,
        jobBadgesContract,
        connectWallet,
        disconnectWallet,
        isConnecting,
      }}
    >
      {children}

      {/* Username Setup Modal for first-time users */}
      {account && (
        <UsernameSetupModal
          isOpen={showUsernameModal}
          walletAddress={account}
          onComplete={handleUsernameSetupComplete}
          onSkip={handleUsernameSetupSkip}
        />
      )}
    </Web3Context.Provider>
  );
};
