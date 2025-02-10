import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css';
import { useState } from "react";

const ConnectButton = ({ selectedChain, setEthereumSigner }) => {

    const [connected, setConnected] = useState(false);
    const [account, setAccount] = useState(null);

  const connectToEthWallet = async() => {
    if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
        }

    try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setEthereumSigner(signer);
    const account = await signer.getAddress();
    setConnected(true);
    
    console.log(`Account is connected to ${account}`);
    } catch (error) {
    console.error("Error: ", error);
    }
}

  return (
    <div className="flex space-x-5 items-center">
      {selectedChain === "SOLANA" ? (
        <WalletMultiButton />
      ) : (
        <button onClick={connectToEthWallet} 
                className="px-6 py-3 text-lg font-bold bg-purple-900 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all"
        >
          {connected?"Connected":"Connect"}
        </button>
      )}
    </div>
  );
};

export default ConnectButton;