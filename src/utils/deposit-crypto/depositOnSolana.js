import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export const depositOnSolana = async (exchangeWallet, amount, selectedCrypto, tokenAddress) => {
  if (!window.solana) {
    alert("Phantom Wallet is not installed");
    return;
  }

  await window.solana.connect();
  const userAddress = window.solana.publicKey.toString();
  const connection = new Connection("https://api.devnet-beta.solana.com");

  // If selectedCrypto is SOL
  if (selectedCrypto === "SOL") {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userAddress),
        toPubkey: new PublicKey(exchangeWallet),
        lamports: amount * 1e9, 
      })
    );

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    console.log("Transaction successful, signature:", signature);
  }

  // If selectedCrypto is SPL Token
  if (selectedCrypto !== "SOL" && tokenAddress) {
    if (!window.solana.publicKey || !window.solana.signTransaction) {
      console.log("Wallet not connected");
      return;
    }

    const decimals = await getTokenDecimals(connection, tokenMintPublicKey);
    console.log(`Token ${tokenAddress} has ${decimals} decimals`);

    const lamports = parseInt(amount * Math.pow(10, decimals));


    const recipientPublicKey = new PublicKey(exchangeWallet);
    const tokenMintPublicKey = new PublicKey(tokenAddress);

    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    try {
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        window.solana.publicKey,
        tokenMintPublicKey,
        window.solana.publicKey,
        true,
        "finalized",
        { commitment: "finalized" },
        tokenProgramId
      );
      console.log("Sender token account:", senderTokenAccount);

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        window.solana.publicKey,
        tokenMintPublicKey,
        recipientPublicKey,
        true,
        "finalized",
        { commitment: "finalized" },
        tokenProgramId
      );
      console.log("Recipient token account:", recipientTokenAccount);

      const decimals = 6;
      const transferInstruction = createTransferCheckedInstruction(
        senderTokenAccount.address,
        tokenMintPublicKey,
        recipientTokenAccount.address,
        window.solana.publicKey,
        lamports,
        decimals,
        [],
        tokenProgramId
      );
      console.log("Transfer instruction:", transferInstruction);

      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = window.solana.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTransaction = await window.solana.signTransaction(transaction);
      console.log("Signed transaction:", signedTransaction);

      try {
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log("Transaction successful, signature:", signature);
      } catch (error) {
        console.error("Transaction failed:", error);
        if (error.logs) {
          console.log("Transaction logs:", error.logs);
        }
        alert("Transaction failed");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed");
    }
  }
};

const getTokenDecimals = async (connection, tokenMintPublicKey) => {
  try {
    const tokenAccountInfo = await connection.getParsedAccountInfo(tokenMintPublicKey);
    if (
      tokenAccountInfo.value &&
      "parsed" in tokenAccountInfo.value.data &&
      tokenAccountInfo.value.data.parsed.info.decimals !== undefined
    ) {
      return tokenAccountInfo.value.data.parsed.info.decimals;
    }
  } catch (error) {
    console.error("Error fetching token decimals:", error);
  }
};