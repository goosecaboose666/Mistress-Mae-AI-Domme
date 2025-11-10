// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ChastityNFT
 * @dev ERC-1155 Utility NFT for token-gated access.
 * This NFT is soul-bound (non-transferable) and implements a price-doubling curve.
 */
contract ChastityNFT is ERC1155, Ownable {
    using Strings for uint256;

    // Base URI for the metadata (e.g., animated SVG padlock)
    string private _baseURI;

    // Token ID 1 is the main Chastity Key
    uint256 private constant CHASTITY_KEY_ID = 1;

    // Price curve parameters
    uint256 private constant INITIAL_PRICE = 0.01 ether; // 0.01 ETH
    uint256 private constant PRICE_DOUBLING_INTERVAL = 100; // Doubles every 100 mints

    // Counter for the number of Chastity Keys minted
    uint256 public totalMinted = 0;

    // Mapping to track if a user has minted a key (for soul-binding)
    mapping(address => bool) public hasMinted;

    constructor(string memory uri)
        ERC1155(uri)
        Ownable(msg.sender)
    {
        _baseURI = uri;
    }

    /**
     * @dev Calculates the current price of the Chastity Key.
     * Price doubles every PRICE_DOUBLING_INTERVAL mints.
     */
    function getCurrentPrice() public view returns (uint256) {
        uint256 multiplier = totalMinted / PRICE_DOUBLING_INTERVAL;
        // Price = INITIAL_PRICE * (2 ^ multiplier)
        return INITIAL_PRICE * (2 ** multiplier);
    }

    /**
     * @dev Mints a Chastity Key (ID 1) to the caller.
     * Requires payment equal to the current price.
     * Is soul-bound (can only be minted once per address).
     */
    function mintChastityKey() public payable {
        require(!hasMinted[msg.sender], "ChastityNFT: Key is soul-bound and already minted.");
        require(msg.value >= getCurrentPrice(), "ChastityNFT: Insufficient ETH sent.");

        // Mark as minted
        hasMinted[msg.sender] = true;

        // Mint the token
        _mint(msg.sender, CHASTITY_KEY_ID, 1, "");

        // Update the total minted count
        totalMinted++;

        // Refund any excess ETH
        if (msg.value > getCurrentPrice()) {
            payable(msg.sender).transfer(msg.value - getCurrentPrice());
        }
    }

    /**
     * @dev Overrides to prevent transfer, making the NFT soul-bound.
     */
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)
        public
        pure
        override
    {
        revert("ChastityNFT: This NFT is soul-bound and cannot be transferred.");
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        pure
        override
    {
        revert("ChastityNFT: This NFT is soul-bound and cannot be transferred.");
    }

    // --- Owner Functions ---

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
