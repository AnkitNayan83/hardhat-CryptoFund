const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe, deployer, mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async () => {
              //Deploy our contract
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", () => {
              it("Sets the aggregator address correctly", async () => {
                  const res = await fundMe.getPriceFeed();
                  assert.equal(res, mockV3Aggregator.address);
              });
          });

          describe("fund", () => {
              it("Should fail if the value is less than minimum usd", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Not enough Value"
                  );
              });

              it("Updates the amount funded in the data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const res = await fundMe.getAmount(deployer);
                  assert.equal(res.toString(), sendValue.toString());
              });
              it("Should add funder address to getFunder array", async () => {
                  await fundMe.fund({ value: sendValue });
                  const res = await fundMe.getFunder(0);
                  assert.equal(res, deployer);
              });
          });

          describe("Withdraw", () => {
              // To add some money in our contract
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("should withdraw eth from a single funder", async () => {
                  //Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Act
                  const transactionRes = await fundMe.Withdraw();
                  const transactionReceipt = await transactionRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  );
              });
              it("allows us to withdraw from multiple getFunder", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedAccount = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedAccount.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Act
                  const transactionRes = await fundMe.Withdraw();
                  const transactionReceipt = await transactionRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  //Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  );
                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAmount(accounts[i].address),
                          0
                      );
                  }
              });
              it("Only allows the owner of the contract to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerAccountConnection = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerAccountConnection.Withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });

              it("cheaper withdraw 1", async () => {
                  //Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Act
                  const transactionRes = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  );
              });

              it("Cheaper Withdraw", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedAccount = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedAccount.fund({ value: sendValue });
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  //Act
                  const transactionRes = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionRes.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  //Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  );
                  await expect(fundMe.getFunder(0)).to.be.reverted;
                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAmount(accounts[i].address),
                          0
                      );
                  }
              });
          });
      });
