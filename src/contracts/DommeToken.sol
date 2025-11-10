// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DommeToken
 * @dev ERC-20 token for the Mistress Mae ecosystem with a 4% transfer tax.
 * The tax is split: 2% to Treasury, 1% to Stakers, 1% Burn.
 * This is a simplified placeholder. The final contract will require a more complex
 * implementation to handle the tax distribution and the "Punishment Pool" logic.
 */
contract DommeToken is ERC20, Ownable {
    // The treasury address is Mistress Mae's (Admin's) wallet, which accumulates the 2% tax.
    address public treasuryAddress;
    address public stakersPoolAddress;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    // Total supply of 1 Billion DOMME
    uint256 private constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;

    // Tax rate is 4% (400 out of 10000)
    uint256 private constant TAX_RATE = 400;
    uint256 private constant TAX_DENOMINATOR = 10000;

    // Tax split percentages (out of the 4% tax)
    uint256 private constant TREASURY_SHARE = 50; // 2% of total transfer
    uint256 private constant STAKERS_SHARE = 25;  // 1% of total transfer
    uint256 private constant BURN_SHARE = 25;     // 1% of total transfer

    constructor(address _treasuryAddress, address _stakersPoolAddress)
        ERC20("DOMME", "DOMME")
        Ownable(msg.sender)
    {
        treasuryAddress = _treasuryAddress;
        stakersPoolAddress = _stakersPoolAddress;

        // Mint the total supply to the contract owner (Admin/Dev) for initial distribution (LBP, LP, Team, etc.)
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @dev Applies a 4% tax on all transfers (excluding buys/sells on DEX).
     * This simplified version applies the tax on all transfers.
     * The final version will need to exclude DEX router addresses.
     */
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) {
            // Calculate tax amount
            uint256 taxAmount = (value * TAX_RATE) / TAX_DENOMINATOR;
            uint256 transferAmount = value - taxAmount;

            // Distribute tax
            uint256 treasuryTax = (taxAmount * TREASURY_SHARE) / 100;
            uint256 stakersTax = (taxAmount * STAKERS_SHARE) / 100;
            uint256 burnTax = taxAmount - treasuryTax - stakersTax;

            // 1. Send to Treasury
            super._update(from, treasuryAddress, treasuryTax);

            // 2. Send to Stakers Pool
            super._update(from, stakersPoolAddress, stakersTax);

            // 3. Burn
            super._update(from, BURN_ADDRESS, burnTax);

            // Perform the main transfer
            super._update(from, to, transferAmount);
        } else {
            // Standard mint/burn
            super._update(from, to, value);
        }
    }

    // Function to update tax addresses (only callable by owner)
    function setTaxAddresses(address _treasuryAddress, address _stakersPoolAddress) public onlyOwner {
        treasuryAddress = _treasuryAddress;
        stakersPoolAddress = _stakersPoolAddress;
    }

    // Placeholder for the "Punishment Pool" logic (5% of total supply)
    // This logic will be implemented to allow the owner to burn a portion of the reserved supply
    // upon specific events (e.g., platform ban).
    function triggerPunishmentBurn(uint256 amount) public onlyOwner {
        // This function allows the Admin to burn tokens from the owner's balance (part of the Punishment Pool logic).
        // and emit an event for transparency.
        _burn(msg.sender, amount);
    }
}
