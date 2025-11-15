// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    
    IERC721 public nftContract;
    
    // Listing structure
    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 price; // in wei
        bool active;
        uint256 listedAt;
    }
    
    // Mapping of tokenId to Listing
    mapping(uint256 => Listing) public listings;
    
    // Array to track all token IDs that have been listed
    uint256[] public listedTokenIds;
    
    // Mapping to track if a token ID is in the listed array
    mapping(uint256 => bool) private isListed;
    
    // Commission percentage (e.g., 250 = 2.5%)
    uint256 public commissionPercentage = 250;
    
    // Total fees collected by marketplace owner
    uint256 public collectedFees = 0;
    
    event ListingCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 timestamp
    );
    
    event Purchase(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );
    
    event PriceUpdated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 newPrice,
        uint256 timestamp
    );
    
    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }
    
    /**
     * @dev List an NFT for sale
     * @param tokenId The ID of the NFT to list
     * @param price The price in wei (1 ETH = 10^18 wei)
     */
    function listNFT(uint256 tokenId, uint256 price) public {
        require(price > 0, "Price must be greater than 0");
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Only NFT owner can list"
        );
        
        listings[tokenId] = Listing(
            msg.sender,
            tokenId,
            price,
            true,
            block.timestamp
        );
        
        if (!isListed[tokenId]) {
            listedTokenIds.push(tokenId);
            isListed[tokenId] = true;
        }
        
        emit ListingCreated(tokenId, msg.sender, price, block.timestamp);
    }
    
    /**
     * @dev Update the price of a listing
     * @param tokenId The ID of the NFT
     * @param newPrice The new price in wei
     */
    function updatePrice(uint256 tokenId, uint256 newPrice) public {
        require(newPrice > 0, "Price must be greater than 0");
        require(listings[tokenId].active, "Listing is not active");
        require(listings[tokenId].seller == msg.sender, "Only seller can update price");
        
        listings[tokenId].price = newPrice;
        emit PriceUpdated(tokenId, msg.sender, newPrice, block.timestamp);
    }
    
    /**
     * @dev Cancel a listing
     * @param tokenId The ID of the NFT
     */
    function cancelListing(uint256 tokenId) public {
        require(listings[tokenId].active, "Listing is not active");
        require(listings[tokenId].seller == msg.sender, "Only seller can cancel");
        
        listings[tokenId].active = false;
        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Purchase an NFT from the marketplace
     * @param tokenId The ID of the NFT to purchase
     */
    function purchase(uint256 tokenId) public payable nonReentrant {
        require(listings[tokenId].active, "NFT is not listed for sale");
        
        Listing memory listing = listings[tokenId];
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Seller cannot buy their own NFT");
        
        // Calculate fee and seller amount
        uint256 fee = (listing.price * commissionPercentage) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Mark listing as inactive
        listings[tokenId].active = false;
        
        // Update collected fees
        collectedFees += fee;
        
        // Transfer NFT to buyer
        nftContract.transferFrom(listing.seller, msg.sender, tokenId);
        
        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success, "Payment transfer to seller failed");
        
        emit Purchase(
            tokenId,
            msg.sender,
            listing.seller,
            listing.price,
            block.timestamp
        );
    }
    
    /**
     * @dev Get all active listings
     */
    function getActiveListings() public view returns (Listing[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            if (listings[listedTokenIds[i]].active) {
                activeCount++;
            }
        }
        
        // Create array with active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            uint256 tokenId = listedTokenIds[i];
            if (listings[tokenId].active) {
                activeListings[index] = listings[tokenId];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @dev Get listing details for a specific NFT
     */
    function getListing(uint256 tokenId) public view returns (Listing memory) {
        return listings[tokenId];
    }
    
    /**
     * @dev Check if an NFT is currently listed
     */
    function isNFTListed(uint256 tokenId) public view returns (bool) {
        return listings[tokenId].active;
    }
    
    /**
     * @dev Set commission percentage (only owner)
     * @param newPercentage The new percentage (e.g., 250 = 2.5%)
     */
    function setCommissionPercentage(uint256 newPercentage) public onlyOwner {
        require(newPercentage <= 10000, "Percentage cannot exceed 100%");
        commissionPercentage = newPercentage;
    }
    
    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdrawFees() public onlyOwner nonReentrant {
        uint256 amount = collectedFees;
        collectedFees = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Fee withdrawal failed");
    }
    
    /**
     * @dev Get the number of listed items
     */
    function getListingCount() public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < listedTokenIds.length; i++) {
            if (listings[listedTokenIds[i]].active) {
                count++;
            }
        }
        return count;
    }
}
