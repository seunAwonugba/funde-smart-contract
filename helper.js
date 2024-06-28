const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    80001: {
        name: "polygon",
        ethUsdPriceFeedAddress: "0xF0d50568e3A7e8259E16663972b11910F89BD8e7",
    },
};

const developmentChains = ["hardhat", "localhost"];

const DECIMAL = 8;
const INITIAL_ANSWER = 200000000000;
module.exports = {
    networkConfig,
    developmentChains,
    DECIMAL,
    INITIAL_ANSWER,
};
