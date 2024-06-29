const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { expect } = require("chai");
describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let sendValue = ethers.parseEther("1");
    beforeEach(async function () {
        await deployments.fixture(["all"]);

        deployer = (await getNamedAccounts()).deployer;

        fundMe = await deployments.get("FundMe");
        mockV3Aggregator = await deployments.get("MockV3Aggregator");

        await ethers.getContractAt(fundMe.abi, fundMe.address);
        await ethers.getContractAt(
            mockV3Aggregator.abi,
            mockV3Aggregator.address
        );
    });

    describe("constructor", async function () {
        it("Set aggregator address", async function () {
            const priceFeed = await fundMe.priceFeed;

            expect(priceFeed == mockV3Aggregator.address);
        });
    });

    describe("fund", async () => {
        it("Error out with insufficient funds", async function () {
            expect(await fundMe.fund).to.be.revertedWith("Insufficient funds");
        });

        it("expect amount sent", async function () {
            await fundMe.fund({ value: sendValue });

            const amountSent = await fundMe.amountSent(deployer);
            expect(amountSent.toString() == sendValue.toString());
        });
    });
});
