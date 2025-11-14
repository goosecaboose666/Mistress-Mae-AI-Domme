// src/web3/reward-distributor.ts

import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const DOMME_ADDRESS = '0x...'; // Replace with actual DOMME token address
const ERC20_ABI = [
    "function transfer(address to, uint amount)"
];

const dommeContract = new ethers.Contract(DOMME_ADDRESS, ERC20_ABI, signer);

async function distributeRewards(recipient: string, amount: string) {
    console.log(`[Reward Distributor] Preparing to send ${amount} $DOMME to ${recipient}...`);

    try {
        const amountWei = ethers.parseEther(amount);
        const tx = await dommeContract.transfer(recipient, amountWei);

        console.log(`[Reward Distributor] Transaction sent. Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`[Reward Distributor] Transaction confirmed. Reward sent to ${recipient}.`);

    } catch (error) {
        console.error(`[Reward Distributor] Error sending reward to ${recipient}:`, error);
    }
}

// Example usage:
// distributeRewards('0xRECIPIENT_ADDRESS', '100'); // Sends 100 $DOMME
