const { network } = require("hardhat");
const {
    developerChains,
    decimals,
    initial_answer,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    if (chainId == 31337) {
        console.log("Local Network Detected...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [decimals, initial_answer],
        });
        log("Mocks Deploy");
        log("--------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
