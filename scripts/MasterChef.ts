import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function deploy({
    deployments,
  }: HardhatRuntimeEnvironment) {
    // Deploy MasterChef
    const tokenAddress = (await deployments.get('SushiToken')).address;
    const sushiToken = await ethers.getContractAt('SushiToken', tokenAddress);
    const MasterChef = await ethers.getContractFactory("MasterChef");
    const masterchef = await MasterChef.deploy(
        sushiToken.address,
        "0x000000000000000000000000000000000000000000000000",
        100,
        7329902,
        9529435
    );
    await masterchef.deployed();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
export default deploy;