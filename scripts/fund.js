const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding Contract");
    const sendValue = ethers.utils.parseEther("5");
    const transactionRes = await fundMe.fund({ value: sendValue });
    const transactionReceipt = await transactionRes.wait(1);
    console.log("Funded");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
