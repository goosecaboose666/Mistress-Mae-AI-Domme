// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ChastityNFT is ERC1155, Ownable {
    IERC20 public dommeToken;
    uint256 public basePrice;
    string public baseURI;
    uint256 public constant TOKEN_ID = 0;

    constructor(address initialOwner, address _dommeTokenAddress, uint256 _basePrice, string memory _baseURI)
        ERC1155("")
        Ownable(initialOwner)
    {
        dommeToken = IERC20(_dommeTokenAddress);
        basePrice = _basePrice;
        baseURI = _baseURI;
    }

    function mint() external {
        uint256 currentSupply = totalSupply(TOKEN_ID);
        uint256 price = calculatePrice(currentSupply);

        require(dommeToken.balanceOf(msg.sender) >= price, "Insufficient DOMME balance");
        require(dommeToken.allowance(msg.sender, address(this)) >= price, "Check token allowance");

        dommeToken.transferFrom(msg.sender, address(this), price);
        _mint(msg.sender, TOKEN_ID, 1, "");
    }

    function calculatePrice(uint256 _currentSupply) public view returns (uint256) {
        // Linear pricing curve: price increases by `basePrice` for each new mint.
        return basePrice + (_currentSupply * basePrice);
    }

    function setBasePrice(uint256 _newBasePrice) external onlyOwner {
        basePrice = _newBasePrice;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    function setDommeTokenAddress(address _newAddress) external onlyOwner {
        dommeToken = IERC20(_newAddress);
    }

    function withdraw() external onlyOwner {
        uint256 balance = dommeToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        dommeToken.transfer(owner(), balance);
    }

    function uri(uint256 _tokenId) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, Strings.toString(_tokenId), ".json"));
    }
}
