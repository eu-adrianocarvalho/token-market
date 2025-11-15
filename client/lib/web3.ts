import { BrowserProvider, Contract, ethers, parseEther } from "ethers";

// Contract ABIs (simplified for basic operations)
export const TOKENIZED_GOODS_ABI = [
  "function mint(address to, string uri) returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getTotalSupply() view returns (uint256)",
  "function burn(uint256 tokenId)",
  "event TokenMinted(uint256 indexed tokenId, address indexed to, string uri)",
];

export const MARKETPLACE_ABI = [
  "function listNFT(uint256 tokenId, uint256 price)",
  "function purchase(uint256 tokenId) payable",
  "function cancelListing(uint256 tokenId)",
  "function updatePrice(uint256 tokenId, uint256 newPrice)",
  "function getListing(uint256 tokenId) view returns (tuple(address seller, uint256 tokenId, uint256 price, bool active, uint256 listedAt))",
  "function getActiveListings() view returns (tuple(address seller, uint256 tokenId, uint256 price, bool active, uint256 listedAt)[])",
  "function isNFTListed(uint256 tokenId) view returns (bool)",
  "event ListingCreated(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 timestamp)",
  "event Purchase(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price, uint256 timestamp)",
];

export class Web3Manager {
  private provider: BrowserProvider | null = null;
  private signer: any = null;
  private nftContract: Contract | null = null;
  private marketplaceContract: Contract | null = null;
  private currentAccount: string | null = null;

  constructor(
    private nftContractAddress: string,
    private marketplaceAddress: string,
  ) {}

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.currentAccount = accounts[0];
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Initialize contracts
      this.nftContract = new Contract(
        this.nftContractAddress,
        TOKENIZED_GOODS_ABI,
        this.signer,
      );

      this.marketplaceContract = new Contract(
        this.marketplaceAddress,
        MARKETPLACE_ABI,
        this.signer,
      );

      return this.currentAccount;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  /**
   * Get the current connected account
   */
  getCurrentAccount(): string | null {
    return this.currentAccount;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.currentAccount !== null && this.provider !== null;
  }

  /**
   * Get wallet balance in ETH
   */
  async getBalance(address: string): Promise<string> {
    console.log("buscando seu saldo...");
    if (!this.provider) throw new Error("Provider not initialized");

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.provider) throw new Error("Provider not initialized");

    const network = await this.provider.getNetwork();
    return {
      chainId: network.chainId,
      name: network.name,
    };
  }

  /**
   * Ensure user is on Sepolia testnet
   */
  async ensureSepoliaNetwork() {
    if (!window.ethereum) throw new Error("MetaMask not found");

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // Sepolia chain ID is 0xaa36a7 (11155111 in decimal)
      if (chainId !== "0xaa36a7") {
        // Try to switch to Sepolia
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch (switchError: any) {
          // If Sepolia is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Testnet",
                  rpcUrls: ["https://sepolia.infura.io/v3/YOUR_INFURA_KEY"],
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error("Error ensuring Sepolia network:", error);
      throw error;
    }
  }

  /**
   * Mint an NFT (seller creates a tokenized good)
   */
  async mintNFT(imageUri: string): Promise<string> {
    if (!this.nftContract) throw new Error("NFT contract not initialized");

    try {
      const tx = await this.nftContract.mint(this.currentAccount, imageUri);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  /**
   * List NFT on marketplace
   */
  async listNFT(tokenId: number, priceEth: string): Promise<string> {
    if (!this.marketplaceContract)
      throw new Error("Marketplace contract not initialized");

    try {
      const priceWei = parseEther(priceEth);
      const tx = await this.marketplaceContract.listNFT(tokenId, priceWei);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error listing NFT:", error);
      throw error;
    }
  }

  /**
   * Purchase an NFT
   */
  async purchaseNFT(tokenId: number, priceEth: string): Promise<string> {
    if (!this.marketplaceContract)
      throw new Error("Marketplace contract not initialized");

    try {
      const priceWei = parseEther(priceEth);
      const tx = await this.marketplaceContract.purchase(tokenId, {
        value: priceWei,
      });
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      throw error;
    }
  }

  /**
   * Get NFT details
   */
  async getNFTDetails(tokenId: number) {
    if (!this.nftContract) throw new Error("NFT contract not initialized");

    try {
      const owner = await this.nftContract.ownerOf(tokenId);
      const uri = await this.nftContract.tokenURI(tokenId);
      return { owner, uri };
    } catch (error) {
      console.error("Error getting NFT details:", error);
      throw error;
    }
  }

  /**
   * Get listing details from marketplace
   */
  async getListingDetails(tokenId: number) {
    if (!this.marketplaceContract)
      throw new Error("Marketplace contract not initialized");

    try {
      const listing = await this.marketplaceContract.getListing(tokenId);
      return {
        seller: listing[0],
        tokenId: listing[1].toString(),
        price: ethers.formatEther(listing[2]),
        active: listing[3],
        listedAt: listing[4].toString(),
      };
    } catch (error) {
      console.error("Error getting listing details:", error);
      throw error;
    }
  }

  /**
   * Get all active listings from marketplace
   */
  async getActiveListings() {
    if (!this.marketplaceContract)
      throw new Error("Marketplace contract not initialized");

    try {
      const listings = await this.marketplaceContract.getActiveListings();
      return listings.map((listing: any) => ({
        seller: listing[0],
        tokenId: listing[1].toString(),
        price: ethers.formatEther(listing[2]),
        active: listing[3],
        listedAt: listing[4].toString(),
      }));
    } catch (error) {
      console.error("Error getting active listings:", error);
      throw error;
    }
  }

  /**
   * Check if an NFT is listed
   */
  async isNFTListed(tokenId: number): Promise<boolean> {
    if (!this.marketplaceContract)
      throw new Error("Marketplace contract not initialized");

    try {
      return await this.marketplaceContract.isNFTListed(tokenId);
    } catch (error) {
      console.error("Error checking if NFT is listed:", error);
      throw error;
    }
  }

  /**
   * Listen to wallet changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", callback);
    }
  }

  /**
   * Listen to network changes
   */
  onChainChanged(callback: (chainId: string) => void) {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", callback);
    }
  }

  /**
   * Remove listeners
   */
  removeListeners() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    }
  }
}

// Export singleton instance
let web3Manager: Web3Manager | null = null;

export function initializeWeb3(nftAddress: string, marketplaceAddress: string) {
  web3Manager = new Web3Manager(nftAddress, marketplaceAddress);
  return web3Manager;
}

export function getWeb3Manager(): Web3Manager {
  if (!web3Manager) {
    throw new Error("Web3 not initialized. Call initializeWeb3 first.");
  }
  return web3Manager;
}
