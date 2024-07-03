const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { expect, assert } = require("chai");
const { developmentChains } = require("../../helper");

if (developmentChains.includes(network.name)) {
    describe("FundMe", async function () {
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        let sendValue = ethers.parseEther("1");
        beforeEach(async function () {
            await deployments.fixture(["all"]);

            const namedAccount = await getNamedAccounts();
            deployer = namedAccount.deployer;

            const fundMeDeployment = await deployments.get("FundMe");
            const mockV3AggregatorDeployment = await deployments.get(
                "MockV3Aggregator"
            );

            // Attach contracts to their respective addresses
            fundMe = await ethers.getContractAt(
                fundMeDeployment.abi,
                fundMeDeployment.address
            );
            mockV3Aggregator = await ethers.getContractAt(
                mockV3AggregatorDeployment.abi,
                mockV3AggregatorDeployment.address
            );
        });

        describe("constructor", async function () {
            it("Set aggregator address", async function () {
                const priceFeed = await fundMe.getPriceFeed();

                expect(priceFeed == mockV3Aggregator.address);
            });
        });

        describe("fund", async () => {
            it("Error out with insufficient funds", async function () {
                expect(await fundMe.fund).to.be.revertedWith(
                    "Insufficient funds"
                );
            });

            it("expect amount sent", async function () {
                const amountFunded = await fundMe.fund({ value: sendValue });
                // console.log("amountFunded", amountFunded);

                const amountSent = await fundMe.getAmountSent(deployer);
                // console.log("amountSent", amountSent);

                assert.equal(amountSent.toString(), sendValue.toString());
            });

            it("Add funder to list", async () => {
                // send  funds

                const sendFunds = await fundMe.fund({ value: sendValue });

                const funder = await fundMe.getFunders(0);

                assert.equal(funder, deployer);
            });
        });

        describe("withdrawal", async () => {
            //before withdrawal, a deposit must have been made and address recorded
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue });
            });

            it("withdraw eth", async () => {
                // get deployer balance
                const startingDeployerBalance =
                    await ethers.provider.getBalance(deployer);
                // get contract balance money sent from before each
                const startingContractBalance =
                    await ethers.provider.getBalance(fundMe.target);

                const withdraw = await fundMe.withdraw();

                const transactionReceipt = await withdraw.wait(1);
                const { gasUsed, gasPrice } = transactionReceipt;
                const totalGasCost = gasUsed * gasPrice;

                const endingContractBalance = await ethers.provider.getBalance(
                    fundMe.target
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );

                assert.equal(endingContractBalance, 0);
                assert.equal(
                    (
                        startingContractBalance + startingDeployerBalance
                    ).toString(),
                    (endingDeployerBalance + totalGasCost).toString()
                );
            });

            it("withdraw eth multiple funders", async () => {
                const signers = await ethers.getSigners();

                // index 0, is the owners account, index 1 upwards, is other account
                for (let index = 1; index < 6; index++) {
                    //connect to other accounts from signers
                    const connectAccounts = await fundMe.connect(
                        signers[index]
                    );
                    const fundContract = await connectAccounts.fund({
                        value: sendValue,
                    });
                }

                // get deployer balance
                const startingDeployerBalance =
                    await ethers.provider.getBalance(deployer);
                // get contract balance money sent from before each
                const startingContractBalance =
                    await ethers.provider.getBalance(fundMe.target);

                const withdraw = await fundMe.withdraw();

                const transactionReceipt = await withdraw.wait(1);
                const { gasUsed, gasPrice } = transactionReceipt;
                const totalGasCost = gasUsed * gasPrice;

                const endingContractBalance = await ethers.provider.getBalance(
                    fundMe.target
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );

                assert.equal(endingContractBalance, 0);
                assert.equal(
                    (
                        startingContractBalance + startingDeployerBalance
                    ).toString(),
                    (endingDeployerBalance + totalGasCost).toString()
                );
                for (let index = 1; index < 6; index++) {
                    assert.equal(
                        await fundMe.getAmountSent(signers[index].address),
                        0
                    );
                }
            });

            it("only owner can withdraw", async () => {
                const signers = await ethers.getSigners();

                const otherAccount = signers[1];

                //connect other account

                const connectOtherAccount = await fundMe.connect(otherAccount);

                await expect(
                    connectOtherAccount.withdraw()
                ).to.be.revertedWithCustomError(fundMe, "FundMe__UnAuthorized");
            });

            it("cheaper multiple withdrawals", async () => {
                const signers = await ethers.getSigners();

                // index 0, is the owners account, index 1 upwards, is other account
                for (let index = 1; index < 6; index++) {
                    //connect to other accounts from signers
                    const connectAccounts = await fundMe.connect(
                        signers[index]
                    );
                    const fundContract = await connectAccounts.fund({
                        value: sendValue,
                    });
                }

                // get deployer balance
                const startingDeployerBalance =
                    await ethers.provider.getBalance(deployer);
                // get contract balance money sent from before each
                const startingContractBalance =
                    await ethers.provider.getBalance(fundMe.target);

                const withdraw = await fundMe.cheaperWithdrawal();

                const transactionReceipt = await withdraw.wait(1);
                const { gasUsed, gasPrice } = transactionReceipt;
                const totalGasCost = gasUsed * gasPrice;

                const endingContractBalance = await ethers.provider.getBalance(
                    fundMe.target
                );
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                );

                assert.equal(endingContractBalance, 0);
                assert.equal(
                    (
                        startingContractBalance + startingDeployerBalance
                    ).toString(),
                    (endingDeployerBalance + totalGasCost).toString()
                );
                for (let index = 1; index < 6; index++) {
                    assert.equal(
                        await fundMe.getAmountSent(signers[index].address),
                        0
                    );
                }
            });
        });
    });
} else {
    describe.skip;
}
