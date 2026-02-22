const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);

  const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e";

  const marketplace = await hre.ethers.getContractAt(
    [
      "function addSupportedToken(address token) public",
      "function supportedTokens(address token) view returns (bool)",
      "function platformWallet() view returns (address)",
    ],
    marketplaceAddress
  );

  // Verify you're the platform wallet
  const platformWallet = await marketplace.platformWallet();
  console.log("Platform wallet:", platformWallet);
  console.log("Your wallet:   ", deployer.address);

  if (platformWallet.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("\nERROR: Your wallet is not the platform wallet. Only the deployer can add tokens.");
    process.exit(1);
  }

  // Token addresses from .env
  const tokens = [
    { name: "USDT", address: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0xEf54C221Fc94517877F0F40eCd71E0A3866D66C2" },
    { name: "USDC", address: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" },
  ];

  for (const token of tokens) {
    const isSupported = await marketplace.supportedTokens(token.address);

    if (isSupported) {
      console.log(`${token.name} (${token.address}) is already supported`);
    } else {
      console.log(`Adding ${token.name} (${token.address})...`);
      const tx = await marketplace.addSupportedToken(token.address);
      await tx.wait();
      console.log(`${token.name} added successfully! Tx: ${tx.hash}`);
    }
  }

  console.log("\nDone! USDT and USDC are now supported for job payments.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
