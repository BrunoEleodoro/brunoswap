import { HardhatRuntimeEnvironment } from "hardhat/types";

async function deploy({
    deployments,
    getNamedAccounts
}: HardhatRuntimeEnvironment) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    // Deploy Sushi Token
    
  const SushiToken = await deploy('SushiToken', {
    from: deployer,
    args: [],
    log: true,
    skipIfAlreadyDeployed: true
  });
}
deploy.tags = ['SushiToken'];
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
export default deploy;