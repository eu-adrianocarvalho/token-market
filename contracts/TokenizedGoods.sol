// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TokenizedGoods is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private tokenIdCounter;
    
    // Mapping to store token URI (metadata)
    mapping(uint256 => string) private tokenURIs;
    
    // Mapping to store the original minter/creator of each token
    mapping(uint256 => address) public tokenCreators;
    
    event TokenMinted(
        uint256 indexed tokenId,
        address indexed to,
        string uri
    );
    
    event TokenBurned(uint256 indexed tokenId);
    
    constructor() ERC721("TokenizedGoods", "TG") {}
    
    /**
     * @dev Mint a new tokenized good
     * @param to The address to mint the token to
     * @param uri The URI pointing to the token metadata (IPFS or local storage path)
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        tokenURIs[tokenId] = uri;
        tokenCreators[tokenId] = msg.sender;
        
        emit TokenMinted(tokenId, to, uri);
        return tokenId;
    }
    
    /**
     * @dev Get the URI of a token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenURIs[tokenId];
    }
    
    /**
     * @dev Set the URI of a token (only owner of token)
     */
    function setTokenURI(uint256 tokenId, string memory newUri) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can update URI");
        tokenURIs[tokenId] = newUri;
    }
    
    /**
     * @dev Get the creator of a token
     */
    function getTokenCreator(uint256 tokenId) public view returns (address) {
        return tokenCreators[tokenId];
    }
    
    /**
     * @dev Burn a token (only owner)
     */
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can burn");
        _burn(tokenId);
        emit TokenBurned(tokenId);
    }
    
    /**
     * @dev Get the total number of tokens minted
     */
    function getTotalSupply() public view returns (uint256) {
        return tokenIdCounter.current();
    }
}
