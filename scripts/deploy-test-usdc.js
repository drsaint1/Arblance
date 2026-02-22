const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying TestUSDC with:", deployer.address);

  const TestUSDC = await hre.ethers.getContractFactory("TestUSDC");
  const usdc = await TestUSDC.deploy();
  await usdc.waitForDeployment();
  const address = await usdc.getAddress();
  console.log("TestUSDC deployed to:", address);

  // Mint 10,000 tUSDC to deployer
  const tx = await usdc.mint(deployer.address, hre.ethers.parseUnits("10000", 6));
  await tx.wait();
  console.log("Minted 10,000 tUSDC to", deployer.address);

  // Register on marketplace
  const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e";
  const marketplace = await hre.ethers.getContractAt(
    ["function addSupportedToken(address) public"],
    marketplaceAddress
  );
  const tx2 = await marketplace.addSupportedToken(address);
  await tx2.wait();
  console.log("Registered tUSDC on marketplace");

  console.log("\n--- UPDATE YOUR .env ---");
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
