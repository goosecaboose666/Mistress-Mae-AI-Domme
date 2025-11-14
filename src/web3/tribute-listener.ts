// src/web3/tribute-listener.ts

import { ethers } from 'ethers';
import { mistressMaeAgent } from '../agent/core';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS!;

// ERC20 Contract addresses and ABIs
const WETH_ADDRESS = '0x...'; // Replace with actual address
const USDC_ADDRESS = '0x...'; // Replace with actual address
const DOMME_ADDRESS = '0x...'; // Replace with actual address
const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const wethContract = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, provider);
const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
const dommeContract = new ethers.Contract(DOMME_ADDRESS, ERC20_ABI, provider);

function listenForTributes() {
    console.log(`[Tribute Listener] Starting to listen for tributes to ${treasuryAddress}...`);

    // Listener for ERC20 tributes
    const erc20TributeHandler = (from: string, to: string, value: ethers.BigNumberish, token: string) => {
        if (to.toLowerCase() === treasuryAddress.toLowerCase()) {
            const amount = ethers.formatEther(value);
            console.log(`[Tribute Listener] ERC20 Tribute received: ${amount} ${token} from ${from}`);
            mistressMaeAgent.handleMessage('twitter', {
                type: 'tribute',
                from,
                value: amount,
                currency: token
            });
        }
    };

    wethContract.on('Transfer', (from, to, value) => erc20TributeHandler(from, to, value, 'WETH'));
    usdcContract.on('Transfer', (from, to, value) => erc20TributeHandler(from, to, value, 'USDC'));
    dommeContract.on('Transfer', (from, to, value) => erc20TributeHandler(from, to, value, 'DOMME'));

    // Listener for native currency (ETH/MATIC) tributes
    provider.on('block', async (blockNumber) => {
        console.log(`[Tribute Listener] Checking block ${blockNumber} for native tributes...`);
        const block = await provider.getBlock(blockNumber);
        if (block && block.transactions) {
            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                if (tx && tx.to && tx.to.toLowerCase() === treasuryAddress.toLowerCase() && tx.value > 0) {
                    const amount = ethers.formatEther(tx.value);
                    console.log(`[Tribute Listener] Native Tribute received: ${amount} from ${tx.from}`);
                    mistressMaeAgent.handleMessage('twitter', {
                        type: 'tribute',
                        from: tx.from,
                        value: amount,
                        currency: 'ETH' // or MATIC, depending on the chain
                    });
                }
            }
        }
    });
}

if (!treasuryAddress) {
    console.error("TREASURY_WALLET_ADDRESS environment variable is not set. Tribute listener cannot start.");
} else {
    listenForTributes();
}
