import { ethers } from 'ethers';
import { switchNetwork } from './switchNetwork';
import erc20Abi from './erc20Abi.json';

interface NetworkConfig {
  chainId: number;
  nativeToken: string;
}

export const depositOnEVM = async (
  exchangeWallet: string,
  amount: string,
  selectedCrypto: string,
  selectedChain: string,
  tokenAddress: string | undefined
): Promise<string | null | undefined> => {
  if (!window.ethereum) {
    alert('MetaMask is not installed');
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();

  const networkMapping: Record<string, NetworkConfig> = {
    ETHEREUM: { chainId: 1, nativeToken: 'ETH' },
    BSC: { chainId: 56, nativeToken: 'BNB' },
    POLYGON: { chainId: 137, nativeToken: 'MATIC' },
    'ARBITRUM ONE': { chainId: 56, nativeToken: 'ARB' },
  };

  const selectedChainData = networkMapping[selectedChain];

  if (!selectedChainData) {
    alert(`Unsupported blockchain: ${selectedChain}`);
    return;
  }

  const { chainId, nativeToken } = selectedChainData;

  const currentNetwork = await provider.getNetwork();
  if (Number(currentNetwork.chainId) !== chainId) {
    const switched = await switchNetwork(chainId);
    if (!switched) return;
  }

  try {
    let tx: ethers.TransactionResponse;
    if (selectedCrypto === nativeToken) {
      const depositAmount = ethers.parseUnits(amount, 'ether');
      tx = await signer.sendTransaction({
        to: exchangeWallet,
        value: depositAmount,
      });
    } else {
      if (!tokenAddress) {
        alert('Invalid token address.');
        return;
      }

      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
      const tokenDecimals: bigint = await tokenContract.decimals();
      const depositAmount = ethers.parseUnits(amount, Number(tokenDecimals));

      tx = await tokenContract.transfer(exchangeWallet, depositAmount);
    }

    await tx.wait();
    console.log(`${selectedCrypto} deposit successful on ${selectedChain}, TX Hash: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    alert('Transaction failed.');
    return null;
  }
};
