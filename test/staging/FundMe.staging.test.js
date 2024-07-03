const { getNamedAccounts, ethers, deployments, network } = require("hardhat");
const { developmentChains } = require("../../helper");
const { assert } = require("chai");
if (developmentChains.includes(network.name)) {
    describe.skip;
    // 0x034C89C4fb414a7545422908F4baF6Be58F5360d
} else {
    describe("FundMe", async () => {
        let fundMe;
        let deployer;
        let mockV3Aggregator;
        let sendValue = ethers.parseEther("0.01");

        beforeEach(async () => {
            const getNamedAccount = await getNamedAccounts();
            deployer = getNamedAccount.deployer;

            const deployFundMe = await deployments.get("FundMe");

            fundMe = await ethers.getContractAt(
                deployFundMe.abi,
                deployFundMe.address
            );
        });

        it("fund and withdraw", async () => {
            await fundMe.fund({ value: sendValue });
            await fundMe.withdraw();

            const endingContractBalance = await ethers.provider.getBalance(
                fundMe.target
            );

            assert.equal(endingContractBalance.toString(), 0);
        });
    });
}
