// Auto-generated contract addresses for Arbitrum One
// Generated at: 2026-02-22T18:15:45.585Z

export const ARBITRUM_ONE_CONFIG = {
  chainId: 42161,
  chainName: "Arbitrum One",
  rpcUrl: "https://arb1.arbitrum.io/rpc",
  blockExplorer: "https://arbiscan.io",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  tokens: {
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  contracts: {
    SkillBadges: "0xFc4EDCF2CA8068b2A750Ad4507297aba0807CdC5",
    JobBadges: "0x962A00d762692F8692B90914577d5191e79a514b",
    FreelanceMarketplace: "0x7292c3Bef25159Fb4119A8CF48AAa027596C7fFD",
    EscrowPayment: "0x9F881e3A5F4Fc1621D3CC2fDc187E8302dc50A96",
    EscrowPaymentToken: "0x4F64da35DA275fC052a01a78603500e592059Cb9",
    DisputeResolution: "0xdc36c3251e56b635a9B4F188389764Cd235939d2",
  },
} as const;

export type ContractName = keyof typeof ARBITRUM_ONE_CONFIG.contracts;
