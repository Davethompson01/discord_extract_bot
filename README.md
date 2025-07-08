# Discord Wallet Native MON Airdrop Bot

A solution for extracting wallet addresses from Discord channels and airdropping native MON (Monad coin) directly to those addresses—no smart contract required!

##  Features

- **Discord Integration**: Extract wallet addresses from Discord channel messages
- **Native MON Airdrop**: Distribute native MON (the coin) directly to wallets
- **Validation**: Automatic wallet address validation and deduplication
- **Batch Processing**: Handles large numbers of recipients efficiently
- **Error Handling**: Robust error handling and transaction monitoring

## 📋 Prerequisites


- Discord Bot Token
- Monad wallet with private key (funded with enough MON)
- Monad RPC endpoint 

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**


3. **Configure your `.env` file:**
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# Monad Configuration
PRIVATE_KEY=your_private_key_here
MONAD_RPC_URL=
```

## 🔧 Setup Instructions

### 1. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token to your `.env` file
5. Enable required intents:
   - Message Content Intent
   - Server Members Intent
6. Invite the bot to your server with appropriate permissions

## 📖 Usage

### Step 1: Extract Wallet Addresses

Run the Discord wallet extractor:

```bash
npm run extract
# or
node extractWallets.js
```

This will:
- Connect to your Discord channel
- Scan all messages for Ethereum/Monad addresses
- Save unique addresses to `extracted_wallets.json` and `wallets.txt`
- Display a summary of found wallets

### Step 2: Airdrop Native MON

Run the native MON airdrop script:

```bash
node airdrop_native_mon.js
```

This will:
- Load the extracted wallet addresses
- Calculate the per-user amount for a fixed total (default: 10 MON)
- Send native MON directly to each address from your wallet
- Provide detailed progress and results

## 📁 File Structure

```
discord_bot_extract/
├── extractWallets.js          # Discord wallet extractor
├── airdrop_native_mon.js      # Native MON airdrop script
├── package.json               # Dependencies and scripts
├── config.env.example         # Environment variables template
└── README.md                  # This file
```

## ⚠️ Important Notes

### Security Considerations

1. **Private Key Security**: Never commit your private key to version control
2. **Test First**: Always test on Monad devnet before mainnet
3. **Gas Fees**: Each transfer will consume gas (MON)
4. **Sufficient Balance**: Ensure your wallet has enough MON to cover the total airdrop and gas fees

### Error Handling

- Invalid addresses are filtered out automatically
- Failed transactions are logged but don't stop the process
- The script provides detailed success/failure statistics

## 🐛 Troubleshooting

### Common Issues

1. **"Channel not found"**
   - Check your `DISCORD_CHANNEL_ID` is correct
   - Ensure the bot has access to the channel

2. **"Insufficient balance"**
   - Fund your wallet with more MON
   - Check your private key and network

3. **"Transaction failed"**
   - Check gas prices and network status
   - Ensure sufficient MON for gas fees

### Debug Mode

Add debug logging by setting:
```bash
DEBUG=true node extractWallets.js
```

## 📊 Example Output

```
Airdrop Summary:
Recipients: 66 wallets
Amount per wallet: 0.151515151515151515 MON
Total amount: 9.99999999999999999 MON
Sender: 0xYourMonadAddress
Sent 0.151515151515151515 MON to 0xabc...123
...
Airdrop complete!
```

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - see LICENSE file for details.

## ⚡ Quick Start

1. Set up your `.env` file
2. Extract wallets: `node extractWallets.js`
3. Execute native MON airdrop: `node airdrop_native_mon.js`

That's it! Your native MON airdrop is complete! 🎉 