import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function deploy({
    deployments,
    getNamedAccounts
  }: HardhatRuntimeEnvironment) {
    // Deploy MasterChef
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const tokenAddress = (await deployments.get('SushiToken')).address;
    const SushiToken = await ethers.getContractAt('SushiToken', tokenAddress);
    const MasterChef = await deploy('MasterChef', {
      from: deployer,
      args: [
        SushiToken.address,
        ethers.constants.AddressZero,
        100,
        7329902,
        9529435
      ],
      log: true,
      skipIfAlreadyDeployed: true
    });
}
deploy.tags = ['MasterChef'];
deploy.dependencies = ['SushiToken'];
deploy.runAtTheEnd = true;
export default deploy;