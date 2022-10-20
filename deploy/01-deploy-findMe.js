// async function deployFunc() {
//     console.log("Test");
// }

const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// module.exports.default = deployFunc;

// module.exports = async (hre) => {
//     const {getNamedAccounts,deployments} = hre;
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    const args = [ethUsdPriceFeedAddress];
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify
        await verify(fundMe.address, args);
    }
    log("------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
