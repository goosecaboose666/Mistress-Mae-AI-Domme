// src/web3/reward-distributor.ts

/**
 * Reward Distributor: Handles the logic for calculating and distributing $DOMME rewards
 * back to users who send tributes.
 *
 * This script is crucial for the "Utility & Value" component, incentivizing the use of $DOMME.
 */

import { ethers, Wallet, Contract, JsonRpcProvider } from 'ethers';

// --- Configuration ---
const CONFIG = {
    // Replace with actual contract addresses and wallet
    MAE_PRIVATE_KEY: "YOUR_MAE_WALLET_PRIVATE_KEY", // Private key for signing reward transactions
    DOMME_CONTRACT_ADDRESS: "0xDommeContractAddress...",
    RPC_URL: "https://polygon-rpc.com", // Example: Polygon RPC
};

// Simplified ERC-20 ABI for the transfer function
const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
];

// --- Reward Logic ---
const REWARD_TIERS = {
    // Reward percentage based on the token used for tribute
    DOMME: 0.05, // 5% reward for $DOMME tributes (strong incentive)
    USDC: 0.02,  // 2% reward for stablecoin tributes
    ETH: 0.01,   // 1% reward for native token tributes (lowest incentive)
};

// --- Main Distributor Class ---
export class RewardDistributor {
    private provider: JsonRpcProvider;
    private wallet: Wallet;
    private dommeContract: Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
        this.wallet = new Wallet(CONFIG.MAE_PRIVATE_KEY, this.provider);
        this.dommeContract = new Contract(CONFIG.DOMME_CONTRACT_ADDRESS, ERC20_ABI, this.wallet);
    }

    /**
     * @dev Calculates and sends the $DOMME reward to the user.
     * @param sender The address of the user who sent the tribute.
     * @param tokenSymbol The symbol of the token sent (e.g., 'DOMME', 'USDC', 'ETH').
     * @param amount The amount of the token sent (as a string).
     */
    public async distributeReward(sender: string, tokenSymbol: string, amount: string) {
        const rewardRate = REWARD_TIERS[tokenSymbol as keyof typeof REWARD_TIERS] || 0;

        if (rewardRate === 0) {
            console.log(`No reward configured for token: ${tokenSymbol}. Skipping distribution.`);
            return;
        }

        // 1. Calculate the reward amount (in the original token's value)
        // NOTE: In a real system, this would require a price oracle (e.g., Chainlink)
        // to convert the tribute amount (e.g., 100 USDC) into a $DOMME equivalent.
        // For this placeholder, we'll assume a simplified 1:1 conversion for demonstration.
        const tributeValue = parseFloat(amount);
        const rewardAmountValue = tributeValue * rewardRate;

        // 2. Convert to $DOMME token units
        const dommeDecimals = await this.dommeContract.decimals();
        const rewardAmountWei = ethers.parseUnits(rewardAmountValue.toFixed(dommeDecimals), dommeDecimals);

        console.log(`Calculated reward for ${sender}: ${rewardAmountValue.toFixed(dommeDecimals)} $DOMME (${rewardRate * 100}% of tribute value).`);

        // 3. Execute the transfer
        try {
            const tx = await this.dommeContract.transfer(sender, rewardAmountWei);
            await tx.wait();
            console.log(`Successfully distributed reward to ${sender}. Transaction Hash: ${tx.hash}`);
        } catch (error) {
            console.error(`Failed to distribute reward to ${sender}:`, error);
            // In a real system, this would log the failure and queue a retry.
        }
    }
}

// --- Example Usage (Called by the Tribute Listener) ---
// const distributor = new RewardDistributor();
// distributor.distributeReward("0xUserWalletAddress", "DOMME", "100.0");
