import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { toast } from 'react-toastify';

const getTokenDecimals = async (
  connection: Connection,
  tokenMintPublicKey: PublicKey
): Promise<number | undefined> => {
  try {
    const tokenAccountInfo = await connection.getParsedAccountInfo(tokenMintPublicKey);
    const value = tokenAccountInfo.value;
    if (value && 'parsed' in value.data) {
      const parsed = (value.data as { parsed: { info: { decimals?: number } } }).parsed;
      if (parsed.info.decimals !== undefined) {
        return parsed.info.decimals;
      }
    }
  } catch (error) {
    console.error('Error fetching token decimals:', error);
  }
  return undefined;
};

export const depositOnSolana = async (
  exchangeWallet: string,
  amount: string,
  selectedCrypto: string,
  tokenAddress?: string
): Promise<void> => {
  const solana = window.solana;
  if (!solana) {
    toast.error('Phantom Wallet is not installed');
    return;
  }

  await solana.connect();
  const userAddress = solana.publicKey.toString();
  const connection = new Connection('https://api.devnet-beta.solana.com');

  if (selectedCrypto === 'SOL') {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userAddress),
        toPubkey: new PublicKey(exchangeWallet),
        lamports: Number(amount) * 1e9,
      })
    );

    const { signature } = await solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    console.log('Transaction successful, signature:', signature);
    return;
  }

  if (selectedCrypto !== 'SOL' && tokenAddress) {
    if (!solana.publicKey || !solana.signTransaction) {
      console.log('Wallet not connected');
      return;
    }

    // FIX: Declare tokenMintPublicKey before passing it to getTokenDecimals.
    const tokenMintPublicKey = new PublicKey(tokenAddress);

    const decimals = (await getTokenDecimals(connection, tokenMintPublicKey)) ?? 6;
    console.log(`Token ${tokenAddress} has ${decimals} decimals`);

    const lamports = Math.trunc(Number(amount) * Math.pow(10, decimals));

    const recipientPublicKey = new PublicKey(exchangeWallet);

    const tokenProgramId = TOKEN_2022_PROGRAM_ID;

    try {
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        solana.publicKey,
        tokenMintPublicKey,
        solana.publicKey,
        true,
        'finalized',
        { commitment: 'finalized' },
        tokenProgramId
      );
      console.log('Sender token account:', senderTokenAccount);

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        solana.publicKey,
        tokenMintPublicKey,
        recipientPublicKey,
        true,
        'finalized',
        { commitment: 'finalized' },
        tokenProgramId
      );
      console.log('Recipient token account:', recipientTokenAccount);

      const transferInstruction = createTransferCheckedInstruction(
        senderTokenAccount.address,
        tokenMintPublicKey,
        recipientTokenAccount.address,
        solana.publicKey,
        lamports,
        decimals,
        [],
        tokenProgramId
      );
      console.log('Transfer instruction:', transferInstruction);

      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = solana.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTransaction = await solana.signTransaction(transaction);
      console.log('Signed transaction:', signedTransaction);

      try {
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('Transaction successful, signature:', signature);
      } catch (error) {
        console.error('Transaction failed:', error);
        const err = error as { logs?: string[] };
        if (err.logs) {
          console.log('Transaction logs:', err.logs);
        }
        toast.error('Transaction failed');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed');
    }
  }
};
