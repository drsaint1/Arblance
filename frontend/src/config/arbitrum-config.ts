// Auto-generated contract addresses for Arbitrum Sepolia Testnet
// Generated at: 2026-02-19T23:29:38.428Z

export const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: 421614,
  chainName: "Arbitrum Sepolia",
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  blockExplorer: "https://sepolia.arbiscan.io",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  contracts: {
    SkillBadges: "0x4F64da35DA275fC052a01a78603500e592059Cb9",
    JobBadges: "0xdc36c3251e56b635a9B4F188389764Cd235939d2",
    FreelanceMarketplace: "0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e",
    EscrowPayment: "0x3CE0f5071AaEc15F519a606BEe5D08c7eFA78461",
    EscrowPaymentToken: "0xfFFEaA39336E9E749091f3e10Baf958a909f69Ae",
    DisputeResolution: "0xAeE0640726c7225053F1Bd65fB72A0bD23F0a80E",
  },
} as const;

export type ContractName = keyof typeof ARBITRUM_SEPOLIA_CONFIG.contracts;
