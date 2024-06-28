const hre = require("hardhat");

const verifyFundMe = async (contractAddress, args) => {
    console.log("Verifying fund me contract");

    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract already verified");
        } else {
            console.log(error);
        }
    }
};

module.exports = { verifyFundMe };
