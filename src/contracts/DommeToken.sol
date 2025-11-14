// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DommeToken is ERC20, Ownable {
    address public treasuryAddress;
    address public stakersAddress;

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public punishmentPool;

    // Tax fees: 4% total tax -> 2% Treasury, 1% Stakers, 1% Burn
    uint256 public treasuryFee = 200; // 2%
    uint256 public stakersFee = 100; // 1%
    uint256 public burnFee = 100; // 1%
    uint256 public constant FEE_DENOMINATOR = 10000;

    constructor(address initialOwner) ERC20("Mistress Mae", "DOMME") Ownable(initialOwner) {
        _mint(msg.sender, TOTAL_SUPPLY);
        treasuryAddress = initialOwner;
        stakersAddress = initialOwner;
    }

    function _update(address from, address to, uint256 value) internal override {
        if (from == address(0) || to == address(0) || from == owner() || to == owner()) {
            super._update(from, to, value);
            return;
        }

        uint256 totalFee = (value * (treasuryFee + stakersFee + burnFee)) / FEE_DENOMINATOR;
        uint256 treasuryAmount = (value * treasuryFee) / FEE_DENOMINATOR;
        uint256 stakersAmount = (value * stakersFee) / FEE_DENOMINATOR;
        uint256 burnAmount = (value * burnFee) / FEE_DENOMINATOR;

        uint256 netAmount = value - totalFee;

        super._update(from, treasuryAddress, treasuryAmount);
        super._update(from, stakersAddress, stakersAmount);
        super._update(from, address(0), burnAmount);
        super._update(from, to, netAmount);
    }

    function setTreasuryAddress(address _newAddress) external onlyOwner {
        treasuryAddress = _newAddress;
    }

    function setStakersAddress(address _newAddress) external onlyOwner {
        stakersAddress = _newAddress;
    }

    function burnFromPunishmentPool() external onlyOwner {
        _burn(address(this), punishmentPool);
        punishmentPool = 0;
    }
}
