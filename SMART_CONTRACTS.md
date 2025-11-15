# Smart Contracts - TokenMarket DApp

This guide explains how to deploy the smart contracts on the Ethereum Sepolia testnet using Remix IDE.

## Prerequisites

1. MetaMask browser extension installed
2. Sepolia testnet added to MetaMask
3. Some test ETH from a Sepolia faucet (https://sepolia-faucet.pk910.de/)

## Smart Contracts

### 1. TokenizedGoods.sol (ERC721)
- Creates NFTs representing tokenized goods
- Allows users to mint, transfer, and burn NFTs
- Each NFT has metadata (URI) pointing to product information

### 2. Marketplace.sol
- Manages the marketplace functionality
- Allows sellers to list NFTs with prices
- Handles purchases and ETH transfers
- Manages commission fees

## Deployment Steps

### Step 1: Deploy TokenizedGoods.sol

1. Go to https://remix.ethereum.org/
2. Create a new file: `TokenizedGoods.sol`
3. Copy the contents from `contracts/TokenizedGoods.sol`
4. In the left sidebar, click "Solidity Compiler"
5. Select compiler version 0.8.20 or higher
6. Click "Compile TokenizedGoods.sol"
7. Click "Deploy & Run Transactions" in the left sidebar
8. Select "Injected Provider - MetaMask" in the Environment dropdown
9. Make sure you're connected to Sepolia testnet
10. Click Deploy
11. Confirm the transaction in MetaMask
12. Copy the deployed contract address from the Deployments section

### Step 2: Deploy Marketplace.sol

1. Create a new file: `Marketplace.sol`
2. Copy the contents from `contracts/Marketplace.sol`
3. Compile Marketplace.sol
4. In the Deploy section, enter the TokenizedGoods contract address in the constructor parameter
5. Click Deploy
6. Confirm the transaction in MetaMask
7. Copy the deployed Marketplace contract address

## Configuration

After deployment, update your `.env` file with the contract addresses:

```
VITE_CONTRACT_ADDRESS=0x<TokenizedGoods_Address>
VITE_MARKETPLACE_ADDRESS=0x<Marketplace_Address>
```

## Testing the Contracts

### In Remix:

1. **Test TokenizedGoods**:
   - In the Deployed Contracts section, expand TokenizedGoods
   - Call `mint(yourAddress, "ipfs://...")` to create an NFT
   - Note the tokenId from the transaction receipt

2. **Test Marketplace**:
   - Call `listNFT(tokenId, priceInWei)` to list an NFT
   - Call `getActiveListings()` to see all active listings
   - Call `purchase(tokenId)` with the correct payment amount to buy an NFT

## Converting ETH to Wei

The contract uses Wei (smallest unit of ETH):
- 1 ETH = 1,000,000,000,000,000,000 Wei
- Use https://eth-converter.com/ to convert
- Or use the formula: ETH × 10^18

Example: 0.5 ETH = 500000000000000000 Wei

## Important Notes

- Keep your .env file secure and never commit it to version control
- The test contracts are for learning purposes
- Always test thoroughly on testnet before deploying to mainnet
- Ensure sufficient Sepolia ETH for gas fees
- Each transaction requires gas fees (paid in Sepolia ETH)

## OpenZeppelin Dependency

The contracts use OpenZeppelin standards:
- Import statements like `@openzeppelin/contracts/token/ERC721/ERC721.sol` are recognized by Remix
- Remix automatically retrieves these dependencies from GitHub

If Remix has issues importing, you can manually add them:
1. Use GitHub's raw content URL
2. Or use the Solidity GitHub import format

## Troubleshooting

### "Contract not found" error
- Make sure both files are properly saved in Remix
- Check that compiler version matches (0.8.20+)

### Transaction fails in Remix
- Ensure you have sufficient Sepolia ETH for gas
- Check that parameters are in correct format (Wei for amounts, correct addresses)

### UI not updating after deployment
- Update `.env` with new contract addresses
- Restart the dev server (`pnpm dev`)

## Next Steps

Once contracts are deployed and `.env` is updated:

1. Run `pnpm dev` to start the application
2. Connect your wallet
3. List items and make purchases
4. Monitor transactions on https://sepolia.etherscan.io/

Happy testing! 🚀
