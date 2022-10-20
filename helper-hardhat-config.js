//This file will tell which address to use on which network

const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
};

const developmentChains = ["hardhat", "localhost"];
const decimals = 8;
const initial_answer = 200000000000;

module.exports = { networkConfig, developmentChains, decimals, initial_answer };
