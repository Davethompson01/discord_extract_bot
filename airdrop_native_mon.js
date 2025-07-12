const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

function getRandomAmount(min, max) {
    const minWei = ethers.parseEther(min.toString());
    const maxWei = ethers.parseEther(max.toString());
    const diff = maxWei - minWei;
    const rand = BigInt(Math.floor(Math.random() * Number(diff)));
    return minWei + rand;
}

function shuffle(array) {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

const PROGRESS_FILE = 'airdrop_progress.json';
const LOG_FILE = 'airdrop_log.json';
const SUMMARY_FILE = 'airdrop_summary.json';
const TXS_COUNT = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MIN_AMOUNT = 0.011;
const MAX_AMOUNT = 0.19;
const MS_IN_DAY = 24 * 60 * 60 * 1000;

function saveProgress(progress) {
    fs.writeFileSync(PRO1GRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return null;
}

function saveLogs(logs) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

function loadLogs() {
    if (fs.existsSync(LOG_FILE)) {
        return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
    return [];
}

function saveSummary(summary) {
    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

    addresses = addresses.filter(addr => ethers.isAddress(addr));
    if (addresses.length < 1) {
        console.error(`Need at least 1 valid wallet address.`);
        process.exit(1);
    }

    // Plan a transaction for each wallet
    const plannedTxs = addresses.map(addr => ({
        to: addr,
        amount: ethers.formatEther(getRandomAmount(MIN_AMOUNT, MAX_AMOUNT)),
        status: 'pending',
        txHash: null,
        error: null,
        timestamp: null,
        gasUsed: null,
        gasPrice: null,
        gasCost: null
    }));

    // Calculate total required
    let totalRequired = plannedTxs.reduce((a, tx) => a + ethers.parseEther(tx.amount), 0n);
    const balance = await provider.getBalance(wallet.address);
    if (balance < totalRequired) {
        console.error(`Insufficient MON balance. Need ${ethers.formatEther(totalRequired)}, have ${ethers.formatEther(balance)}`);
        process.exit(1);
    }

    let logs = loadLogs();
    let totalGasSpent = 0n;
    for (let txIdx = 0; txIdx < plannedTxs.length; txIdx++) {
        const txObj = plannedTxs[txIdx];
        try {
            const tx = await wallet.sendTransaction({
                to: txObj.to,
                value: ethers.parseEther(txObj.amount)
            });
            const receipt = await tx.wait();
            const timestamp = new Date(Date.now()).toISOString();
            txObj.status = 'sent';
            txObj.txHash = tx.hash;
            txObj.timestamp = timestamp;
            txObj.gasUsed = receipt.gasUsed.toString();
            txObj.gasPrice = receipt.gasPrice ? receipt.gasPrice.toString() : (tx.gasPrice ? tx.gasPrice.toString() : '');
            // Calculate gas cost (gasUsed * gasPrice)
            let gasCost = 0n;
            if (txObj.gasUsed && txObj.gasPrice) {
                gasCost = BigInt(txObj.gasUsed) * BigInt(txObj.gasPrice);
                txObj.gasCost = gasCost.toString();
                totalGasSpent += gasCost;
            }
            console.log(`Sent ${txObj.amount} MON to ${txObj.to} at ${timestamp} | Gas used: ${txObj.gasUsed}, Gas price: ${txObj.gasPrice}`);
            logs.push({ to: txObj.to, amount: txObj.amount, txHash: tx.hash, timestamp, gasUsed: txObj.gasUsed, gasPrice: txObj.gasPrice, gasCost: txObj.gasCost });
            saveLogs(logs);
        } catch (err) {
            console.error(`Failed to send to ${txObj.to}:`, err.message);
            txObj.status = 'failed';
            txObj.error = err.message;
            txObj.timestamp = new Date(Date.now()).toISOString();
            logs.push({ to: txObj.to, amount: txObj.amount, error: err.message, timestamp: txObj.timestamp });
            saveLogs(logs);
        }
    }

    // Write summary file
    const summary = { txs: [], total: '0.0', walletCounts: {}, totalGasSpent: totalGasSpent.toString() };
    let overallTotal = 0;
    for (const tx of plannedTxs) {
        const amt = parseFloat(tx.amount);
        if (tx.status === 'sent') overallTotal += amt;
        if (!summary.walletCounts[tx.to]) summary.walletCounts[tx.to] = 0;
        summary.walletCounts[tx.to]++;
        summary.txs.push({
            to: tx.to,
            amount: tx.amount,
            status: tx.status,
            txHash: tx.txHash,
            error: tx.error,
            timestamp: tx.timestamp,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
            gasCost: tx.gasCost
        });
    }
    summary.total = overallTotal.toFixed(6);
    saveSummary(summary);
    console.log(`\nAirdrop complete! Summary written to ${SUMMARY_FILE}`);
    console.log(`Total gas spent: ${ethers.formatEther(totalGasSpent)} MON`);
}

if (require.main === module) {
    main().catch(console.error);
} 