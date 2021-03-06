import React from 'react';
import { useEffect, useState } from "react";
import './App.css';
import { ethers } from 'ethers';
import contractABI from './utils/NFTCollectible.json';
import Me from './assets/Me.jpg';
import NFT from './assets/preview-nft.png';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import LoadingIndicator from './components/LoadingIndicator.js';

// //old
// const contractAddress = '0x6Ee2d7619eBbADfeb006Ee0bdf69785C1Ce07c24';
const contractAddress = '0xFCA2bc35129e16500C22e7094B7c671F3aE9F916';
const abi = contractABI.abi;
const RARIBLE_LINK = `https://rinkeby.rarible.com/collection/${contractAddress}/items`;

function App() {

  const [network, setNetwork] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isMintingNFT, setIsMintingNFT] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask installed!");
        toast.warn("Make sure you have MetaMask installed", {
          position: "top-left",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        //check to make sure on the right checkNetwork
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        // Hex code of the chainId of the Rinkeby test network
        const rinkebyChainId = "0x4";
        if (chainId === rinkebyChainId) {
          setNetwork("Rinkeby")
        }

        //get account 
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
          toast.success("???? Wallet is Connected", {
            position: "top-left",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          console.log('No authorized account found');
        }
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  // HANDLERS

  const connectWalletHandler = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please download MetaMask to use this dapp");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const mintNftHandler = async () => {
    setIsMintingNFT(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther('0.01') });
        console.log("Minting... please wait")
        toast.info("Minting NFT...", {
          position: "top-left",
          autoClose: 6050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await nftTxn.wait();
        console.log('NFT minted');
        // toast.success("NFT Minted!", {
        //   position: "top-left",
        //   autoClose: 2000,
        //   hideProgressBar: true,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        // });
        setIsMintingNFT(false);
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (err) {
      setIsMintingNFT(false);
      console.log(err);
    }
  }

  // Set up the listener
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a few minutes show up on Rarible. Here's the link: https://rinkeby.rarible.com/token/${contractAddress}:${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // USE EFFECTS

  useEffect(() => {
    checkIfWalletIsConnected();
    setupEventListener();
  }, []);

  //listen for chain and account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })

      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  })

  // RENDER METHODS

  const renderButtonOrRinkebyWarning = () => {
    if (!currentAccount) {
      return (
        <button onClick={connectWalletHandler}>
          Connect Wallet
        </button>
      )
    }

    if (currentAccount && network === "Rinkeby") {
      return (
        <button disabled={isMintingNFT} onClick={mintNftHandler} className={isMintingNFT? 'accomodate-for-loader' : ''} >
          {!isMintingNFT ? 'Mint NFT' : 'Minting.... Please confirm the transaction.'}
          {renderLoader()}
        </button>
      )
    }

    if (currentAccount && network === "") {
      return <p className="rinkeby-only">
        This dapp only works on the Rinkeby Test Network. To mint an NFT, please switch networks in your connected wallet.
      </p>
    }
  }

  const renderLoader = () => {
    if (isMintingNFT) {
      return (
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      )
    }
  }

  const renderPreviewNFT = () => {
    return (
      <img className='preview-nft' src={NFT} alt="preview nft" />
    )
  }

  const renderOpenSeaButton = () => {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          window.location.href = RARIBLE_LINK;
        }}
      >???? Check out the collection on Rarible</button>
    )
  }

  const renderTestEthMessage = () => {
    if (currentAccount && network === "Rinkeby") {
      return <p className="test-eth">
        If you need test ETH, try using <a href="https://faucets.chain.link/rinkeby">this faucet</a>.
      </p>
    }
  }

  return (
    <div className='main-app'>
      <div className='container'>
        <div className='header-container'>
          <h1 className="header">Scrappy Squirrels</h1>
          <p className="sub-text">
            ???? A generative art NFT collection on the Ethereum blockchain ????
          </p>
          {renderButtonOrRinkebyWarning()}
          {renderTestEthMessage()}
          {/* {renderLoader()} */}
          {renderPreviewNFT()}
          {renderOpenSeaButton()}
        </div>
        <div className="footer-container">
          <a
            href={'https://www.mattmiller.app/'}
            target="_blank"
            rel="noreferrer"
          ><img alt="My avatar" className="my-avatar" src={Me} /><p>Built By Matt</p></a>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App;
