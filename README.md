# TokenMarket - Decentralized NFT Marketplace DApp

A full-stack decentralized application (DApp) for buying and selling tokenized goods (NFTs) on the Ethereum Sepolia testnet.

## 🌟 Features

- **MetaMask Integration**: Secure wallet connection and authentication
- **NFT Trading**: Buy and sell tokenized goods as ERC721 NFTs
- **Smart Contracts**: Automated transactions via Ethereum smart contracts
- **Image Hosting**: Local storage for product images
- **User Profiles**: Seller and buyer accounts with wallet authentication
- **Transaction History**: Track all marketplace transactions
- **Responsive Design**: Mobile-friendly interface
- **Docker Support**: One-command deployment with Docker Compose

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **TypeScript** for type safety
- **Tailwind CSS 3** for styling
- **React Router 6** for navigation
- **ethers.js** for Web3 interactions
- **shadcn/ui** for UI components

### Backend
- **Express.js** server
- **SQLite3** for persistent data storage
- **Multer** for file uploads
- **ethers.js** for Ethereum interactions

### Smart Contracts
- **Solidity 0.8.20+**
- **ERC721** standard for NFTs
- **OpenZeppelin** libraries for security

## 📋 Prerequisites

- Node.js 18+ and pnpm
- MetaMask browser extension
- Sepolia testnet configured in MetaMask
- Sepolia testnet ETH (from faucet)
- Docker and Docker Compose (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
pnpm install
```

### 2. Deploy Smart Contracts

Follow the detailed guide in [SMART_CONTRACTS.md](./SMART_CONTRACTS.md):

1. Go to https://remix.ethereum.org/
2. Deploy `TokenizedGoods.sol` (ERC721 contract)
3. Deploy `Marketplace.sol` with TokenizedGoods address
4. Copy the deployed contract addresses

### 3. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update with your contract addresses:

```
VITE_CONTRACT_ADDRESS=0x<Your_TokenizedGoods_Address>
VITE_MARKETPLACE_ADDRESS=0x<Your_Marketplace_Address>
```

### 4. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:8080`

### 5. Using Docker (Optional)

To run everything in Docker:

```bash
docker-compose up --build
```

This will:
- Build the application
- Start the Express server
- Initialize SQLite database
- Serve the frontend
- All on port 8080

## 📖 How to Use

### For Buyers

1. **Connect Wallet**: Click "Connect Wallet" button (requires MetaMask on Sepolia)
2. **Browse Marketplace**: View all available tokenized goods
3. **View Details**: Click on an item to see full details
4. **Purchase**: Click "Buy Now" and confirm in MetaMask
5. **Own NFT**: The NFT is transferred to your wallet immediately after purchase

### For Sellers

1. **Connect Wallet**: Choose "Seller" role when connecting
2. **List Items**: Go to "Sell" section
3. **Upload Image**: Select a product photo (max 5MB)
4. **Fill Details**: Add title, description, price, category, condition
5. **List**: Submit the form to list your item
6. **Receive Payment**: ETH is automatically sent to your wallet when someone buys

## 🏗️ Project Structure

```
├── contracts/                 # Smart contracts
│   ├── TokenizedGoods.sol    # ERC721 NFT contract
│   └── Marketplace.sol        # Marketplace contract
│
├── client/                    # React frontend
│   ├── components/
│   │   ├── Header.tsx         # Navigation header
│   │   └── ui/               # shadcn/ui components
│   ├── pages/
│   │   ├── Home.tsx          # Landing page
│   │   ├── Marketplace.tsx    # Browse listings
│   │   ├── Sell.tsx          # Create listing
│   │   ├── ProductDetail.tsx  # Product view & purchase
│   │   └── NotFound.tsx       # 404 page
│   ├── lib/
│   │   ├── web3.ts           # Web3 utilities
│   │   ├── web3Context.tsx   # Web3 state management
│   │   └── utils.ts          # Helper functions
│   ├── App.tsx               # App entry point
│   ├── global.css            # Global styles
│   └── vite-env.d.ts         # Vite environment types
│
├── server/                    # Express backend
│   ├── routes/
│   │   ├── auth.ts           # User authentication
│   │   ├── listings.ts        # Listing CRUD
│   │   ├── uploads.ts         # File upload handler
│   │   ├── transactions.ts    # Transaction management
│   │   └── demo.ts           # Demo endpoint
│   ├── index.ts              # Server setup
│   ├── db.ts                 # Database initialization
│   └── node-build.ts         # Production server entry
│
├── public/                    # Static files
│   ├── uploads/              # Product images
│   └── ...
│
├── shared/                    # Shared types
│   └── api.ts
│
├── Dockerfile                # Docker image
├── docker-compose.yml        # Docker Compose config
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/wallet` - Register/login with wallet
- `GET /api/users/:walletAddress` - Get user profile
- `PUT /api/users/:walletAddress` - Update user profile

### Listings
- `GET /api/listings` - Get all active listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing details
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Deactivate listing
- `GET /api/sellers/:sellerWallet/listings` - Get seller's listings

### Uploads
- `POST /api/upload` - Upload image (multipart/form-data)

### Transactions
- `POST /api/transactions` - Create transaction record
- `GET /api/transactions/:txHash` - Get transaction details
- `PUT /api/transactions/:id/status` - Update transaction status
- `GET /api/users/:walletAddress/transactions` - Get user's transactions

## 🔐 Security

- All user data tied to verified MetaMask wallet
- Transactions require blockchain confirmation
- Images stored locally with size limits (5MB)
- Database validation for all inputs
- No private keys stored in the application

## 📝 Database Schema

### Users Table
- wallet_address (unique)
- username, email, bio
- user_type (seller, buyer, both)
- avatar_url, created_at, updated_at

### Listings Table
- token_id (blockchain NFT ID)
- seller_wallet, seller_id
- title, description, price_eth
- image_url, category, condition
- is_active, created_at, updated_at

### Transactions Table
- token_id, seller_wallet, buyer_wallet
- listing_id, price_eth, tx_hash
- status (pending, completed, failed)
- created_at, completed_at

## 🧪 Testing the Smart Contracts

Use Remix IDE to test:

1. **Mint NFTs**: Create test NFTs with sample metadata URIs
2. **List NFTs**: List created NFTs on the marketplace
3. **Purchase**: Complete purchase transactions
4. **Verify Ownership**: Check that buyer owns the NFT after purchase

See [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for detailed testing instructions.

## 📦 Building for Production

```bash
pnpm build
```

This creates:
- `dist/spa/` - Built frontend (served by server)
- `dist/server/` - Compiled server code

## 🚀 Deployment

### With Docker
```bash
docker-compose up --build
```

### On Netlify
```bash
pnpm build
# Deploy the entire directory to Netlify
```

### On Vercel
```bash
pnpm build
# Deploy to Vercel
```

## 🐛 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Verify Sepolia testnet is selected
- Try disconnecting and reconnecting

### Smart Contract Errors
- Check contract addresses in `.env` match deployed contracts
- Verify sufficient Sepolia ETH for gas fees
- Ensure contracts are on Sepolia testnet (chain ID: 11155111)

### Database Issues
- Ensure `./data/` directory exists and is writable
- Check that SQLite3 is properly installed
- Delete `./data/marketplace.db` to reset database

### Image Upload Issues
- Check file size is under 5MB
- Ensure file format is supported (JPG, PNG, GIF)
- Verify `./public/uploads/` directory exists

## 📚 Learning Resources

- [ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 📄 License

This project is for educational purposes.

## 💡 Future Enhancements

- [ ] Advanced search and filtering
- [ ] Offer/bidding system
- [ ] User ratings and reviews
- [ ] Multi-signature escrow
- [ ] IPFS integration for images
- [ ] ENS name resolution
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Mainnet deployment
- [ ] Auction functionality

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📞 Support

For issues and questions:
1. Check [SMART_CONTRACTS.md](./SMART_CONTRACTS.md) for deployment help
2. Review error messages in browser console
3. Check MetaMask network and account settings
4. Verify contract addresses in `.env`

---

**Happy Trading! 🎉**

This is a learning project designed to demonstrate blockchain integration with a React DApp. Always test thoroughly on testnet before using with real assets.
