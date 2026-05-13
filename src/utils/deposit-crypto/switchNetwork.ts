import { ethers } from 'ethers';

export const switchNetwork = async (chainId: number): Promise<boolean> => {
  if (!window.ethereum) {
    alert('MetaMask is not installed');
    return false;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ethers.toBeHex(chainId) }],
    });
    return true;
  } catch (error) {
    const err = error as { code?: number };
    if (err.code === 4902) {
      alert('Network not added to MetaMask. Add it manually.');
    } else {
      console.error('Error switching network:', error);
    }
    return false;
  }
};
