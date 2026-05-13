import { ethers } from 'ethers';
import { depositOnEVM } from './depositOnEvm';
import { depositOnSolana } from './depositOnSolana';
import { depositCryptoApi } from '../../api/user';
import { fetchCryptocurrency } from '../../api/cryptocurrencies';

export const depositCrypto = async (
  selectedCrypto: string | null,
  selectedChain: string,
  amount: string,
  _ethereumSigner: ethers.Signer | null,
  userAddress?: string
): Promise<void> => {
  if (!selectedCrypto || !selectedChain) {
    alert('Please select a cryptocurrency and blockchain.');
    return;
  }

  try {
    const data = await fetchCryptocurrency(selectedCrypto);
    if (!data) return;

    const selectedChainData = data.chains.find(
      (chain) => chain.chain_name === selectedChain
    );
    if (!selectedChainData) {
      alert(`No wallet address found for ${selectedChain}.`);
      return;
    }

    const exchangeWallet = selectedChainData.wallet_address;
    const tokenAddress = selectedChainData.contract_address;

    let txHash: string | null | undefined;
    if (['ETHEREUM', 'BSC', 'MATIC', 'ARBITRUM ONE'].includes(selectedChain)) {
      txHash = await depositOnEVM(
        exchangeWallet,
        amount,
        selectedCrypto,
        selectedChain,
        tokenAddress
      );
    } else if (selectedChain === 'SOLANA') {
      await depositOnSolana(exchangeWallet, amount, selectedCrypto, tokenAddress);
      // depositOnSolana currently logs its own signature; treat as success-on-no-throw.
      txHash = 'solana-tx';
    }

    if (!txHash) {
      alert('Transaction failed or not signed.');
      return;
    }

    const depositResult = await depositCryptoApi(
      userAddress,
      selectedCrypto,
      amount,
      txHash,
      selectedChain
    );
    if (depositResult.success) {
      alert(`Deposit successful on ${selectedChain}!`);
    } else {
      alert(depositResult.message ?? 'Deposit failed.');
    }
  } catch (error) {
    console.error('Crypto deposit failed:', error);
    alert('Transaction failed. Please try again.');
  }
};
