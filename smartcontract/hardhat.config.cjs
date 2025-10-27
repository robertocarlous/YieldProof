require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, CELOSCAN_API_KEY, CELO_MAINNET_RPC } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: CELO_MAINNET_RPC || "https://forno.celo.org",
        enabled: true,
        // Don't specify blockNumber - use latest
      },
      chainId: 42220,
      hardfork: "cancun", // Force Cancun hardfork
      allowUnlimitedContractSize: true,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    celoMainnet: {
      url: CELO_MAINNET_RPC || "https://forno.celo.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 42220,
    },
    celoAlfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 44787,
    },
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11142220,
    },
  },
  etherscan: {
    apiKey: {
      celo: CELOSCAN_API_KEY || "abc",
      celoAlfajores: CELOSCAN_API_KEY || "abc",
      celoSepolia: "abc",
    },
    customChains: [
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
      {
        network: "celoAlfajores",
        chainId: 44787,
        urls: {
          apiURL: "https://api-alfajores.celoscan.io/api",
          browserURL: "https://alfajores.celoscan.io",
        },
      },
      {
        network: "celoSepolia",
        chainId: 11142220,
        urls: {
          apiURL: "https://api-sepolia-blockscout.celo-testnet.org/api",
          browserURL: "https://celo-sepolia.blockscout.com",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};