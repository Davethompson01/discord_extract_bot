const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

async function main() {
   
    const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL || process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Load wallet addresses
    let addresses = [];
    if (fs.existsSync('extracted_wallets.json')) {
        const data = JSON.parse(fs.readFileSync('extracted_wallets.json', 'utf8'));
        addresses = data.wallets;
    } else if (fs.existsSync('wallets.txt')) {
        addresses = fs.readFileSync('wallets.txt', 'utf8').split('\n').filter(Boolean);
    } else {
        console.error('No wallet files found. Run extractWallets.js.');
        process.exit(1);
    }

    // Validate addresses
    addresses = addresses.filter(addr => ethers.isAddress(addr));
    if (addresses.length === 0) {
        console.error('No valid wallet addresses found.');
        process.exit(1);
    }

    // Calculate per-user amount for a fixed total 
    const totalAmount = ethers.parseEther("10"); // I used 10mon for this
    const numUsers = addresses.length;
    const amountPerUser = totalAmount / BigInt(numUsers);

    console.log(`\nAirdrop Summary:`);
    console.log(`Recipients: ${numUsers} wallets`);
    console.log(`Amount per wallet: ${ethers.formatEther(amountPerUser)} MON`);
    console.log(`Total amount: ${ethers.formatEther(amountPerUser * BigInt(numUsers))} MON`);
    console.log(`Sender: ${wallet.address}`);

    // Check sender balance
    const balance = await provider.getBalance(wallet.address);
    if (balance < amountPerUser * BigInt(numUsers)) {
        console.error(`Insufficient MON balance. Need ${ethers.formatEther(amountPerUser * BigInt(numUsers))}, have ${ethers.formatEther(balance)}`);
        process.exit(1);
    }

    
    for (let i = 0; i < addresses.length; i++) {
        const to = addresses[i];
        try {
            const tx = await wallet.sendTransaction({
                to,
                value: amountPerUser
            });
            console.log(`Sent ${ethers.formatEther(amountPerUser)} MON to ${to}`);
            await tx.wait();
        } catch (err) {
            console.error(`Failed to send to ${to}:`, err.message);
        }
        //   delay 
        await new Promise(res => setTimeout(res, 1000));
    }

    console.log('\nAirdrop complete!');
}

if (require.main === module) {
    main().catch(console.error);
} 