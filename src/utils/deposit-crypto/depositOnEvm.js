import { ethers } from "ethers";
import { switchNetwork } from "./switchNetwork";
import erc20Abi from "./erc20Abi.json";

export const depositOnEVM = async (exchangeWallet, amount, selectedCrypto, selectedChain, tokenAddress) => {
  if (!window.ethereum) {
    alert("MetaMask is not installed");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const networkMapping = {
    "ETHEREUM": { chainId: 1, nativeToken: "ETH" },
    "BSC": { chainId: 56, nativeToken: "BNB" },
    "POLYGON": { chainId: 137, nativeToken: "MATIC" },
    "ARBITRUM ONE": {chainId: 56, nativeToken: "ARB"}
  };

  const selectedChainData = networkMapping[selectedChain];

  if (!selectedChainData) {
    alert(`Unsupported blockchain: ${selectedChain}`);
    return;
  }

  const { chainId, nativeToken } = selectedChainData;

  // If user is on the wrong chain, ask them to switch
  const currentNetwork = await provider.getNetwork();
  if (currentNetwork.chainId !== chainId) {
    const switched = await switchNetwork(chainId);
    if (!switched) return;
  }

  try {
    let tx;
    if (selectedCrypto === nativeToken) {

      const depositAmount = ethers.parseUnits(amount, "ether");
      tx = await signer.sendTransaction({
        to: exchangeWallet,
        value: depositAmount,
      });
    } else {

      if (!tokenAddress) {
        alert("Invalid token address.");
        return;
      }

      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, signer);
      const tokenDecimals = await tokenContract.decimals();
      const depositAmount = ethers.parseUnits(amount, tokenDecimals);

      tx = await tokenContract.transfer(exchangeWallet, depositAmount);
    }

    await tx.wait();
    console.log(`${selectedCrypto} deposit successful on ${selectedChain}, TX Hash: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error("Transaction failed:", error);
    alert("Transaction failed.");
    return null;
  }
};