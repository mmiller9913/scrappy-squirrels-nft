//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";

// for mathematical operations
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// nft contrct to inherit from
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// this lets us console.log in our contract
import "hardhat/console.sol";

// Our contract will inherit from OpenZeppelin’s ERC721Enumerable and Ownable contracts
// The former has a default implementation of the ERC721 (NFT) standard in addition to a few helper functions that are useful when dealing with NFT collections.
// The latter allows us to add administrative privileges to certain aspects of our contract.
contract NFTCollectible is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant PRICE = 0.01 ether;
    uint256 public constant MAX_PER_MINT = 2; // max # of mints per trasnaction

    string public baseTokenURI; // The IPFS URL of the folder containing the JSON metadata.

    event NewNFTMinted(address sender, uint256 tokenId);

    // set the name and symbol of our NFT collection
    constructor(string memory baseURI) ERC721("ScrappySquirrels", "SS") {
        setBaseURI(baseURI);
    }

    // only contract ownder can call this
    // reserving 2 NFTs for owner & team
    function reserveNFTs() public onlyOwner {
        uint256 totalMinted = _tokenIds.current();
        require(totalMinted.add(2) < MAX_SUPPLY, "Not enough NFTs");
        for (uint256 i = 0; i < 2; i++) {
            _mintSingleNFT();
        }
    }

    // NFT JSON metadata is available at a certain IPFS url
    // OpenZeppelin’s implementation automatically deduces the URI for each token. It assumes that token 1’s metadata will be available at ipfs://QmZbWNKJPAjxXuNFSEaksCJVd1M6DaKQViJBYPK2BdpDEP/1
    // need to tell our contract that the baseTokenURI variable that we defined is the base URI that the contract must use.
    // To do this, we override an empty function in ERC721 called _baseURI() and make it return baseTokenURI
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    // mint NFTs
    // must be payable since users send ether
    function mintNFTs(uint256 _count) public payable {
        uint256 totalMinted = _tokenIds.current();

        // require that there are enough NFTs left
        require(totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs!");

        // require that caller has requested to mint > 0 & < MAX_PER_MINT NFTs
        require(
            _count > 0 && _count <= MAX_PER_MINT,
            "Cannot mint specified number of NFTs."
        );

        // require caller to have sent enough ether to mint requested number of NFTs
        require(
            msg.value >= PRICE.mul(_count),
            "Not enough ether to purchase NFTs."
        );

        for (uint256 i = 0; i < _count; i++) {
            _mintSingleNFT();
        }
    }

    // private = only callable from other function inside the contract
    function _mintSingleNFT() private {
        uint256 newTokenID = _tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _tokenIds.increment();

        console.log(
            "An NFT w/ ID %s has been minted to %s",
            newTokenID,
            msg.sender
        );

        emit NewNFTMinted(msg.sender, newTokenID);

        // don’t need to explicitly set the metadata for each NFT
        // setting the base URI ensures that each NFT gets the correct metadata (stored in IPFS) assigned automatically.
    }

    // getting all tokens held by a particular account -- returns array of tokenIds held by an account
    // using ERC721Enumerable ‘s balanceOf and tokenOfOwnerByIndex functions
    // external can only be called outside the contract
    // view = by running the function, no data is saved or altered
    function tokensOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        // balanceOf: Returns the number of tokens in owner's account.
        uint256 tokenCount = balanceOf(_owner);
        // making empty array of uint256's called tokenId of length = tokenCount
        uint256[] memory tokensId = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            // tokenOfOwnerByIndex: Returns a token ID owned by owner at a given index of its token list.
            // "at position i, return the tokenId held by the owner"
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    // withdraw the ether sent to our contract
    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");
        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }
}
