# Discord Wallet Native MON Airdrop Bot

A solution for extracting wallet addresses from Discord channels and airdropping native MON (Monad coin) directly to those addresses—no smart contract required!

##  Features

- **Discord Integration**: Extract wallet addresses from Discord channel messages
- **Native MON Airdrop**: Distribute native MON directly to wallets
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