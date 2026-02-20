const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting full deployment to Arbitrum Sepolia Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Chain ID:", hre.network.config.chainId);
  console.log("\n" + "━".repeat(60) + "\n");

  const deployedContracts = {};

  try {
    // 1. Deploy SkillBadges
    console.log("📚 Deploying SkillBadges...");
    const SkillBadges = await hre.ethers.getContractFactory("SkillBadges");
    const skillBadges = await SkillBadges.deploy();
    await skillBadges.waitForDeployment();
    const skillBadgesAddress = await skillBadges.getAddress();
    deployedContracts.skillBadges = skillBadgesAddress;
    console.log("✅ SkillBadges deployed to:", skillBadgesAddress);
    console.log("");

    // 2. Deploy JobBadges
    console.log("🏆 Deploying JobBadges...");
    const JobBadges = await hre.ethers.getContractFactory("JobBadges");
    const jobBadges = await JobBadges.deploy();
    await jobBadges.waitForDeployment();
    const jobBadgesAddress = await jobBadges.getAddress();
    deployedContracts.jobBadges = jobBadgesAddress;
    console.log("✅ JobBadges deployed to:", jobBadgesAddress);
    console.log("");

    // 3. Deploy FreelanceMarketplace
    console.log("🏢 Deploying FreelanceMarketplace...");
    const FreelanceMarketplace = await hre.ethers.getContractFactory("FreelanceMarketplace");
    const marketplace = await FreelanceMarketplace.deploy(skillBadgesAddress, jobBadgesAddress);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    deployedContracts.marketplace = marketplaceAddress;
    console.log("✅ FreelanceMarketplace deployed to:", marketplaceAddress);
    console.log("");

    // 4. Deploy EscrowPayment
    console.log("💰 Deploying EscrowPayment...");
    const EscrowPayment = await hre.ethers.getContractFactory("EscrowPayment");
    const escrowPayment = await EscrowPayment.deploy();
    await escrowPayment.waitForDeployment();
    const escrowPaymentAddress = await escrowPayment.getAddress();
    deployedContracts.escrowPayment = escrowPaymentAddress;
    console.log("✅ EscrowPayment deployed to:", escrowPaymentAddress);
    console.log("");

    // 5. Deploy EscrowPaymentToken
    console.log("🪙 Deploying EscrowPaymentToken...");
    const EscrowPaymentToken = await hre.ethers.getContractFactory("EscrowPaymentToken");
    const usdtAddress = "0xEf54C221Fc94517877F0F40eCd71E0A3866D66C2";
    const usdcAddress = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";
    const escrowPaymentToken = await EscrowPaymentToken.deploy(usdtAddress, usdcAddress);
    await escrowPaymentToken.waitForDeployment();
    const escrowPaymentTokenAddress = await escrowPaymentToken.getAddress();
    deployedContracts.escrowPaymentToken = escrowPaymentTokenAddress;
    console.log("✅ EscrowPaymentToken deployed to:", escrowPaymentTokenAddress);
    console.log("");

    // 6. Deploy DisputeResolution
    console.log("⚖️  Deploying DisputeResolution...");
    const DisputeResolution = await hre.ethers.getContractFactory("DisputeResolution");
    const disputeResolution = await DisputeResolution.deploy();
    await disputeResolution.waitForDeployment();
    const disputeResolutionAddress = await disputeResolution.getAddress();
    deployedContracts.disputeResolution = disputeResolutionAddress;
    console.log("✅ DisputeResolution deployed to:", disputeResolutionAddress);
    console.log("");

    console.log("━".repeat(60) + "\n");

    // Save deployment info to JSON
    const deploymentInfo = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber(),
      contracts: deployedContracts,
    };

    // Save to root directory
    const deploymentPath = path.join(__dirname, `../deployments/arbitrum-sepolia-${Date.now()}.json`);
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);

    // Save latest deployment
    const latestPath = path.join(__dirname, "../deployments/arbitrum-sepolia-latest.json");
    fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Latest deployment saved to:", latestPath);

    // Create frontend config file
    const frontendConfigDir = path.join(__dirname, "../frontend/src/config");
    if (!fs.existsSync(frontendConfigDir)) {
      fs.mkdirSync(frontendConfigDir, { recursive: true });
    }

    const frontendConfig = {
      [hre.network.name]: {
        chainId: hre.network.config.chainId,
        rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
        blockExplorer: "https://sepolia.arbiscan.io",
        contracts: {
          SkillBadges: skillBadgesAddress,
          JobBadges: jobBadgesAddress,
          FreelanceMarketplace: marketplaceAddress,
          EscrowPayment: escrowPaymentAddress,
          EscrowPaymentToken: escrowPaymentTokenAddress,
          DisputeResolution: disputeResolutionAddress,
        },
      },
    };

    // Read existing config if it exists
    const configPath = path.join(frontendConfigDir, "contracts.json");
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
      existingConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    // Merge configs
    const mergedConfig = { ...existingConfig, ...frontendConfig };
    fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
    console.log("📝 Frontend config updated at:", configPath);

    // Create TypeScript config file for frontend
    const tsConfigContent = `// Auto-generated contract addresses for Arbitrum Sepolia Testnet
// Generated at: ${new Date().toISOString()}

export const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: ${hre.network.config.chainId},
  chainName: "Arbitrum Sepolia",
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
  blockExplorer: "https://sepolia.arbiscan.io",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  contracts: {
    SkillBadges: "${skillBadgesAddress}",
    JobBadges: "${jobBadgesAddress}",
    FreelanceMarketplace: "${marketplaceAddress}",
    EscrowPayment: "${escrowPaymentAddress}",
    EscrowPaymentToken: "${escrowPaymentTokenAddress}",
    DisputeResolution: "${disputeResolutionAddress}",
  },
} as const;

export type ContractName = keyof typeof ARBITRUM_SEPOLIA_CONFIG.contracts;
`;

    const tsConfigPath = path.join(frontendConfigDir, "arbitrum-config.ts");
    fs.writeFileSync(tsConfigPath, tsConfigContent);
    console.log("📝 TypeScript config created at:", tsConfigPath);

    console.log("\n" + "━".repeat(60));
    console.log("✨ DEPLOYMENT COMPLETED SUCCESSFULLY! ✨");
    console.log("━".repeat(60) + "\n");

    console.log("📋 Deployment Summary:");
    console.log("━".repeat(60));
    console.log(`🌐 Network:              ${hre.network.name}`);
    console.log(`🔗 Chain ID:             ${hre.network.config.chainId}`);
    console.log(`👤 Deployer:             ${deployer.address}`);
    console.log(`🔍 Block Explorer:       https://sepolia.arbiscan.io`);
    console.log("━".repeat(60));
    console.log("\n📦 Contract Addresses:");
    console.log("━".repeat(60));
    console.log(`📚 SkillBadges:          ${skillBadgesAddress}`);
    console.log(`🏆 JobBadges:            ${jobBadgesAddress}`);
    console.log(`🏢 FreelanceMarketplace: ${marketplaceAddress}`);
    console.log(`💰 EscrowPayment:        ${escrowPaymentAddress}`);
    console.log(`🪙 EscrowPaymentToken:   ${escrowPaymentTokenAddress}`);
    console.log(`⚖️  DisputeResolution:    ${disputeResolutionAddress}`);
    console.log("━".repeat(60) + "\n");

    console.log("🔗 View contracts on block explorer:");
    console.log(`   https://sepolia.arbiscan.io/address/${marketplaceAddress}\n`);

    console.log("📝 Next steps:");
    console.log("   1. Update your frontend .env file with NEXT_PUBLIC_CHAIN_ID=421614");
    console.log("   2. Import the contract config from 'src/config/arbitrum-config.ts'");
    console.log("   3. Configure MetaMask to connect to Arbitrum Sepolia");
    console.log("   4. Get testnet ETH from Arbitrum Sepolia faucet\n");

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
