import '@nomiclabs/hardhat-solhint';
import '@nomiclabs/hardhat-waffle';
import * as fs from 'fs';
import 'hardhat-contract-sizer';
import 'hardhat-deploy';
import { submitSources } from 'hardhat-deploy/dist/src/etherscan';
import { Deployment } from 'hardhat-deploy/dist/types';
import { task } from 'hardhat/config';
import * as types from 'hardhat/internal/core/params/argumentTypes';
import path from 'path';

import { HardhatRuntimeEnvironment, HardhatUserConfig } from 'hardhat/types';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('custom-etherscan', 'submit contract source code to etherscan')
  .addOptionalParam('apikey', 'etherscan api key', undefined, types.string)
  .addFlag(
    'solcInput',
    'fallback on solc-input (useful when etherscan fails on the minimum sources, see https://github.com/ethereum/solidity/issues/9573)'
  )
  .setAction(async (args, hre) => {
    const keyfile = path.join(__dirname, './.etherscan-keys.json');
    const etherscanApiKey =
      args.apiKey ||
      process.env.ETHERSCAN_API_KEY ||
      JSON.parse(fs.readFileSync(keyfile).toString())[hre.network.name];
    if (!etherscanApiKey) {
      throw new Error(
        `No Etherscan API KEY provided. Set it through comand line option or by setting the "ETHERSCAN_API_KEY" env variable`
      );
    }

    const solcInputsPath = path.join(
      hre.config.paths.deployments,
      hre.network.name,
      'solcInputs'
    );

    await submitSources(hre, solcInputsPath, {
      etherscanApiKey,
      license: 'None',
      fallbackOnSolcInput: args.solcInput,
      forceLicense: true,
    });
  });

task(
  'list-deployments',
  'List all the deployed contracts for a network',
  async (args, hre) => {
    console.log(`All deployments on ${hre.network.name}:`);
    for (const [name, deployment] of Object.entries(
      await hre.deployments.all()
    )) {
      console.log(`${name}: ${deployment.address}`);
    }
  }
);

async function exportAddresses(args, hre: HardhatRuntimeEnvironment) {
  let addresses: Record<string, string> = {};
  const addressesPath = path.join(__dirname, './build/addresses.json');
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(
      (await fs.promises.readFile(addressesPath)).toString()
    );
  }
  const networkAddresses = Object.entries(await hre.deployments.all()).map(
    ([name, deployRecord]: [string, Deployment]) => {
      return [name, deployRecord.address];
    }
  );
  const chainId = await hre.getChainId();
  const previous = hre.network.name === 'localhost' ? addresses['43114'] : {};
  addresses[chainId] = { ...previous, ...Object.fromEntries(networkAddresses) };
  const stringRepresentation = JSON.stringify(addresses, null, 2);

  await fs.promises.writeFile(addressesPath, stringRepresentation);
  console.log(`Wrote ${addressesPath}. New state:`);
  console.log(addresses);

  return addresses[chainId];
}

task(
  'export-addresses',
  'Export deployment addresses to JSON file',
  exportAddresses
);

task('print-network', 'Print network name', async (args, hre) =>
  console.log(hre.network.name)
);


const homedir = require('os').homedir();
const privateKey = fs.readFileSync(`${homedir}/.learning-secret`).toString().trim();

const config: HardhatUserConfig = {
  paths: {
    artifacts: './build/artifacts',
    tests: './tests',
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      blockGasLimit: 8000000,
      forking: {
        url: 'https://api.avax.network/ext/bc/C/rpc'
      },
      // mining: {
      //   auto: false,
      //   interval: 1000
      // },
      accounts: [{ privateKey, balance: '10000168008000000000000' }]
    },
    localhost: {
      blockGasLimit: 8000000,
      url: 'http://localhost:8545',
      accounts: [privateKey]
    },
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      accounts: [privateKey],
      blockGasLimit: 8000000
      // gasPrice: 29500000000
    },
  },
  solidity: {
    version: '0.8.3',
    settings: {
      optimizer: {
        enabled: true,
        // TODO
        runs: 1
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
  }
};

export default config;
