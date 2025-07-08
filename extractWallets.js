const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Ethereum address regex pattern
const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;

class WalletExtractor {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            partials: [Partials.Channel, Partials.Message]
        });
        
        this.wallets = new Set();
        this.messageCount = 0;
    }

    async start() {
        console.log(' Starting Discord wallet extractor...');
        
        this.client.on('ready', () => {
            console.log(` Bot logged in as ${this.client.user.tag}`);
            this.extractWallets();
        });

        await this.client.login(process.env.DISCORD_TOKEN);
    }

    async extractWallets() {
        try {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            if (!channel) {
                console.error(' Channel not found!');
                return;
            }

            console.log(` Extracting wallets from channel: ${channel.name}`);
            
            let lastMessageId = null;
            let hasMoreMessages = true;
            const batchSize = 100;

            while (hasMoreMessages) {
                const options = { limit: batchSize };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                const messages = await channel.messages.fetch(options);
                
                if (messages.size === 0) {
                    hasMoreMessages = false;
                    break;
                }

                for (const [id, message] of messages) {
                    this.processMessage(message);
                    lastMessageId = id;
                }

                this.messageCount += messages.size;
                console.log(` Processed ${this.messageCount} messages, found ${this.wallets.size} unique wallets`);
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.saveWallets();
            
        } catch (error) {
            console.error(' Error extracting wallets:', error);
        } finally {
            this.client.destroy();
        }
    }

    processMessage(message) {
        
        const content = message.content;
        const addresses = content.match(ETH_ADDRESS_REGEX);
        
        if (addresses) {
            addresses.forEach(address => {
              
                if (this.isValidAddress(address)) {
                    this.wallets.add(address.toLowerCase());
                }
            });
        }

       
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                if (attachment.name && attachment.name.includes('.txt')) {
                    
                    console.log(` Found attachment: ${attachment.name}`);
                }
            });
        }
    }

    isValidAddress(address) {
        // Basic Ethereum address validation
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    saveWallets() {
        const walletArray = Array.from(this.wallets);
        const data = {
            timestamp: new Date().toISOString(),
            totalWallets: walletArray.length,
            wallets: walletArray
        };

        fs.writeFileSync('extracted_wallets.json', JSON.stringify(data, null, 2));
        fs.writeFileSync('wallets.txt', walletArray.join('\n'));
        
        console.log(`Extracted ${walletArray.length} unique wallet addresses`);
        console.log(' Saved to: extracted_wallets.json and wallets.txt');
        
        
        if (walletArray.length > 0) {
            console.log('\n📋 Preview of extracted wallets:');
            walletArray.slice(0, 5).forEach((wallet, index) => {
                console.log(`${index + 1}. ${wallet}`);
            });
            if (walletArray.length > 5) {
                console.log(`... and ${walletArray.length - 5} more`);
            }
        }
    }
}


if (require.main === module) {
    const extractor = new WalletExtractor();
    extractor.start().catch(console.error);
}

module.exports = WalletExtractor; 