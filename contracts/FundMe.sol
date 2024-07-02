// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "contracts/PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error FundMe__UnAuthorized();

contract FundMe {
    uint public constant minUSD = 5 * 1e18;
    address public owner;
    // using PriceConverter for uint256;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert FundMe__UnAuthorized();
        }
        _;
    }

    //ket track of eveyone that sent money , store their address in funders array
    address[] public funders;

    mapping(address => uint) public amountSent;

    function fund() public payable {
        //set min fund value in USD

        // require(getConversionRate(msg.value) >= minUSD, "Insufficient funds");

        require(
            PriceConverter.getConversionRate(msg.value, priceFeed) >= minUSD,
            "Insufficient funds"
        );
        funders.push(msg.sender);

        //set the mapping value
        amountSent[msg.sender] = msg.value;

        //0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
    }

    function withdraw() public onlyOwner {
        // require(owner == msg.sender, "Only owners can withdraw");
        for (uint i = 0; i < funders.length; i++) {
            address fundersAddress = funders[i];
            amountSent[fundersAddress] = 0;
        }

        //reset funders array
        funders = new address[](0);

        //withdraw the money to the person calling this function
        //3 ways to transfer

        // 1. Using transfer method

        // payable(msg.sender).transfer(address(this).balance);

        // // 2. Using send method

        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send not successful");

        // 2. Using call method

        (bool callSuccess, ) = payable(msg.sender).call{
            value: (address(this).balance)
        }("");
        require(callSuccess, "Call failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
