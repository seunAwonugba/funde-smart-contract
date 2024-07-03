const dotenv = require("dotenv");
dotenv.config();
// import { HardhatUserConfig } from "hardhat/config";
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("solidity-coverage");

const {
    SEPOLIA_URL,
    WALLET_ACCOUNT_PRIVATE_KEY,
    ETHERSCAN_API_KEY,
    COIN_MARKET_CAP_API_KEY,
} = process.env;
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.0",
            },
            {
                version: "0.8.24",
            },
            {
                version: "0.7.0",
            },
        ],
    },
    networks: {
        sepolia: {
            url: SEPOLIA_URL,
            accounts: [String(WALLET_ACCOUNT_PRIVATE_KEY)],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        currency: "USD",
        L1: "ethereum",
        // coinmarketcap: COIN_MARKET_CAP_API_KEY,
    },
};

// export default config;
