import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { Wallet } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

interface ConnectButtonProps {
  selectedChain: string;
  setEthereumSigner: (signer: ethers.Signer | null) => void;
}

const ConnectButton = ({ selectedChain, setEthereumSigner }: ConnectButtonProps) => {
  const [address, setAddress] = useState<string | null>(null);

  const connectEvm = async () => {
    if (!window.ethereum) { toast.error('MetaMask not installed'); return; }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      setEthereumSigner(signer);
      const addr = await signer.getAddress();
      setAddress(`${addr.slice(0, 6)}…${addr.slice(-4)}`);
    } catch { toast.error('Wallet connection failed'); }
  };

  if (selectedChain === 'Solana' || selectedChain === 'SOLANA') {
    return <WalletMultiButton />;
  }

  return (
    <button
      type="button"
      onClick={connectEvm}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
        address
          ? 'border-buy/40 bg-buy-muted text-buy'
          : 'border-border bg-bg-elevated text-text-primary hover:border-accent hover:text-accent'
      }`}
    >
      <Wallet size={15} />
      {address ? `Connected: ${address}` : 'Connect Wallet'}
    </button>
  );
};

export default ConnectButton;
