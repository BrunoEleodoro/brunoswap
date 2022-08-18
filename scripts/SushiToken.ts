import { ethers } from "hardhat";

async function main() {
    // Deploy Sushi Token
    const SushiToken = await ethers.getContractFactory("SushiToken");
    const sushi = await SushiToken.deploy();
    await sushi.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
