const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { expect, assert } = require("chai");
describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let sendValue = ethers.parseEther("1");
    beforeEach(async function () {
        await deployments.fixture(["all"]);

        deployer = (await getNamedAccounts()).deployer;

        const fundMeDeployment = await deployments.get("FundMe");
        const mockV3AggregatorDeployment = await deployments.get(
            "MockV3Aggregator"
        );

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
            const priceFeed = await fundMe.priceFeed();

            expect(priceFeed == mockV3Aggregator.address);
        });
    });

    describe("fund", async () => {
        it("Error out with insufficient funds", async function () {
            expect(await fundMe.fund).to.be.revertedWith("Insufficient funds");
        });

        it("expect amount sent", async function () {
            const amountFunded = await fundMe.fund({ value: sendValue });
            // console.log("amountFunded", amountFunded);

            const amountSent = await fundMe.amountSent(deployer);
            // console.log("amountSent", amountSent);

            assert.equal(amountSent.toString(), sendValue.toString());
        });

        it("Add funder to list", async () => {
            // send  funds

            const sendFunds = await fundMe.fund({ value: sendValue });

            const funder = await fundMe.funders(0);

            assert.equal(funder, deployer);
        });
    });

    describe("withdrawal", async () => {
        //before withdrawal, a deposit must have been made and address recorded
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue });
        });

        it("withdraw eth", async () => {
            // get contract balance money sent from before each
            const startingContractBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            // get deployer balance
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            );

            const withdraw = await fundMe.withdraw();

            const transactionReceipt = await withdraw.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const totalGasCost = gasUsed.mul(effectiveGasPrice);

            const endingContractBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            );

            assert.equal(endingContractBalance, 0);
            assert.equal(
                startingContractBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(totalGasCost).toString()
            );
        });
    });
});
