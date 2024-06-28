// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //get price of eth in USD using an oracle to help communicate with external world

    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();

        return uint(answer * 1e10);
    }

    // get price always return lates price of 1eth to dolls

    function getConversionRate(
        uint _ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint) {
        uint ethPrice = getPrice(priceFeed);
        uint ethAmountInUSD = (ethPrice * _ethAmount) / 1e18;
        return ethAmountInUSD;
    }
}
