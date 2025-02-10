import { depositOnEVM } from "./depositOnEvm";
import { depositCryptoApi } from "../../api/user";
import { fetchCryptocurrency } from "../../api/cryptocurrencies";
export const depositCrypto = async (selectedCrypto, selectedChain, amount, ethereumSigner, userAddress) => {
  if (!selectedCrypto || !selectedChain) {
    alert("Please select a cryptocurrency and blockchain.");
    return;
  }

  try {
    const data = await fetchCryptocurrency(selectedCrypto);
    if (!data) return;

    const selectedChainData = data.chains.find(chain => chain.chain_name === selectedChain);
    if (!selectedChainData) {
      alert(`No wallet address found for ${selectedChain}.`);
      return;
    }

    const exchangeWallet = selectedChainData.wallet_address;
    const tokenAddress = data.contract_address;

    let txHash;
    if (["ETHEREUM", "BSC", "MATIC", "ARBITRUM ONE"].includes(selectedChain)) {
      txHash = await depositOnEVM(exchangeWallet, amount, selectedCrypto, selectedChain, tokenAddress, ethereumSigner);
    } else if (selectedChain === "SOLANA") {
      txHash = await depositOnSolana(exchangeWallet, amount, selectedCrypto, tokenAddress);
    }

    if (!txHash) {
      alert("Transaction failed or not signed.");
      return;
    }

    const depositResult = await depositCryptoApi(userAddress, selectedCrypto, amount, txHash, selectedChain);
    if (depositResult.success) {
      alert(`Deposit successful on ${selectedChain}!`);
    } else {
      alert(depositResult.message);
    }
  } catch (error) {
    console.error("Crypto deposit failed:", error);
    alert("Transaction failed. Please try again.");
  }
};