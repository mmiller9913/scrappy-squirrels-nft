// npx hardhat run scripts/run.js --network rinkeby

const { utils } = require("ethers");

async function main() {
    // IPFS url of our NFT project metadata 
    // see how to set this here: https://medium.com/scrappy-squirrels/tutorial-nft-metadata-ipfs-and-pinata-9ab1948669a3
    //tutorial version
    // const baseTokenURI = "ipfs://QmZbWNKJPAjxXuNFSEaksCJVd1M6DaKQViJBYPK2BdpDEP/";
    //my version 
    const baseTokenURI = "ipfs://Qmb8Ld6wcjd2vWQRvEfKTsG9outUSCQfnhrC9agYjfLHw4/";

    // Get owner/deployer's wallet address
    const [owner] = await hre.ethers.getSigners();

    // Get contract that we want to deploy
    const contractFactory = await hre.ethers.getContractFactory("NFTCollectible");

    // Deploy contract with the correct constructor arguments
    const contract = await contractFactory.deploy(baseTokenURI);

    // Wait for this transaction to be mined
    await contract.deployed();

    // Get contract address
    console.log("Contract deployed to:", contract.address);

    // Reserve 2 NFTs
    let txn = await contract.reserveNFTs();
    await txn.wait();
    console.log("2 NFTs have been reserved");

    // Mint 2 NFTs by sending 0.02 ether
    txn = await contract.mintNFTs(2, { value: utils.parseEther('0.02') });
    await txn.wait()

    // Get all token IDs of the owner
    let tokens = await contract.tokensOfOwner(owner.address)
    console.log("Owner has tokens: ", tokens);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });