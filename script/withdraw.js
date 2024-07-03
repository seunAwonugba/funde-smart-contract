const { getNamedAccounts, deployments, ethers } = require("hardhat");

const main = async () => {
    let sendValue = ethers.parseEther("0.01");

    const namedAccounts = await getNamedAccounts();
    const deployer = namedAccounts.deployer;

    const deployFundMe = await deployments.get("FundMe");

    const fundMe = await ethers.getContractAt(
        deployFundMe.abi,
        deployFundMe.address
    );

    const fund = await fundMe.withdraw();
    await fund.wait(1);

    console.log("Withdrawn!!!");
};

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
