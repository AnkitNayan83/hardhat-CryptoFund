// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

//NatSpac
/** @title A contract for crowd funding
 * @author Ankit Nayan
 * @notice This contract is use to share etherium
 */

contract FundMe {
    //Type Declaration
    using priceConverter for uint256;

    // State Variable
    uint256 public constant minimumUsd = 10 * 1e18;
    address[] private funders;
    mapping(address => uint256) private addressToAmountFunded;
    address private immutable owner;
    AggregatorV3Interface private priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == owner, "Unauthorized"); //middleware
        //Custom Error to save gas
        if (msg.sender != owner) {
            revert FundMe__NotOwner();
        }
        _; // next
    }

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUsd,
            "Not enough Value"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function Withdraw() public payable onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            addressToAmountFunded[funder] = 0; //After withdrawing money from the contract the value will be 0
        }
        funders = new address[](0); //Reset
        //Withdraw
        (bool callSuccess, ) = owner.call{value: address(this).balance}("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory memoryFunders = funders;
        //mapping can't be in memory
        for (uint256 i = 0; i < memoryFunders.length; i++) {
            address funder = memoryFunders[i];
            addressToAmountFunded[funder] = 0; //After withdrawing money from the contract the value will be 0
        }
        funders = new address[](0); //Reset
        //Withdraw
        (bool callSuccess, ) = owner.call{value: address(this).balance}("");
        require(callSuccess, "Call Failed");
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getAmount(address funder) public view returns (uint256) {
        return addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
