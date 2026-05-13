import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

interface ConnectButtonProps {
  selectedChain: string;
  setEthereumSigner: (signer: ethers.Signer | null) => void;
}

const ConnectButton = ({ selectedChain, setEthereumSigner }: ConnectButtonProps) => {
  const [connected, setConnected] = useState<boolean>(false);

  const connectToEthWallet = async (): Promise<void> => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      setEthereumSigner(signer);
      const account = await signer.getAddress();
      setConnected(true);

      console.log(`Account is connected to ${account}`);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  return (
    <div className="flex space-x-5 items-center">
      {selectedChain === 'SOLANA' ? (
        <WalletMultiButton />
      ) : (
        <button
          onClick={connectToEthWallet}
          className="px-6 py-3 text-lg font-bold bg-purple-900 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all"
        >
          {connected ? 'Connected' : 'Connect'}
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
