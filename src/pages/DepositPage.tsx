import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { depositCrypto } from '../utils/deposit-crypto/depositCrypto';
import ConnectButton from '../components/ConnectButton';
import { fetchCryptocurrencies } from '../api/cryptocurrencies';

interface ChainOption {
  chain_name: string;
}

interface DepositCrypto {
  name: string;
  symbol: string;
  chains: ChainOption[];
}

interface CryptosResponse {
  status: string;
  data?: { cryptocurrencies?: DepositCrypto[] };
}

const DepositPage = () => {
  const [cryptocurrencies, setCryptocurrencies] = useState<DepositCrypto[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [isCryptoDeposit, setIsCryptoDeposit] = useState<boolean>(true);
  const [selectedCrypto, setSelectedCrypto] = useState<DepositCrypto | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [ethereumSigner, setEthereumSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = (await fetchCryptocurrencies()) as CryptosResponse;
        if (data.status === 'success' && data.data?.cryptocurrencies) {
          setCryptocurrencies(data.data.cryptocurrencies);
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
        toast.error('Failed to load cryptocurrencies.');
      }
    };
    void load();
  }, []);

  const handleCryptoDeposit = async () => {
    if (!selectedCrypto || !selectedChain || !amount) {
      toast.error('Please select a cryptocurrency, chain, and enter an amount.');
      return;
    }
    await depositCrypto(selectedCrypto.symbol, selectedChain, amount, ethereumSigner, undefined);
  };

  const handleUSDDeposit = () => {
    toast.info('USD deposit is not yet available.');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-gray-900 py-6 shadow-md">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl text-center font-bold text-yellow-400">Deposit Funds</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-4xl bg-gray-900 p-8 rounded-lg shadow-lg">
          <div className="flex justify-center gap-8 mb-8">
            <button
              onClick={() => setIsCryptoDeposit(false)}
              className={`w-1/2 py-3 rounded-lg text-lg font-semibold transition ${!isCryptoDeposit ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}
            >
              Deposit USD
            </button>
            <button
              onClick={() => setIsCryptoDeposit(true)}
              className={`w-1/2 py-3 rounded-lg text-lg font-semibold transition ${isCryptoDeposit ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}
            >
              Deposit Crypto
            </button>
          </div>

          {isCryptoDeposit ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 relative">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Select Crypto</label>
                  <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-lg">
                    <select
                      onChange={(e) => {
                        const selected = cryptocurrencies.find((t) => t.symbol === e.target.value);
                        setSelectedCrypto(selected ?? null);
                        setSelectedChain('');
                      }}
                      className="w-full appearance-none bg-transparent text-white font-medium focus:outline-none"
                    >
                      <option value="">-- Select Crypto --</option>
                      {cryptocurrencies.map((crypto) => (
                        <option key={crypto.symbol} value={crypto.symbol}>
                          {crypto.name} ({crypto.symbol})
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Select Chain</label>
                  <div className={`relative border border-gray-700 rounded-xl p-3 shadow-lg ${selectedCrypto ? 'bg-gray-900' : 'bg-gray-800 opacity-50 cursor-not-allowed'}`}>
                    <select
                      onChange={(e) => setSelectedChain(e.target.value)}
                      disabled={!selectedCrypto}
                      className="w-full appearance-none bg-transparent text-white font-medium focus:outline-none disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Chain --</option>
                      {selectedCrypto?.chains.map((chain) => (
                        <option key={chain.chain_name} value={chain.chain_name}>
                          {chain.chain_name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full flex-1">
                  <input
                    type="text"
                    placeholder="Amount to deposit"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <ConnectButton selectedChain={selectedChain} setEthereumSigner={setEthereumSigner} />
              </div>

              <button
                onClick={() => void handleCryptoDeposit()}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transition hover:bg-green-600 disabled:opacity-50"
                disabled={!selectedCrypto || !selectedChain || !amount}
              >
                Deposit Crypto
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <input
                type="number"
                placeholder="Amount to deposit"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={handleUSDDeposit}
                disabled={!amount}
                className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transition hover:bg-green-600 disabled:opacity-50"
              >
                Deposit USD
              </button>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center">
        <a href="/user-dashboard" className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg transition hover:bg-gray-600">
          Back to Dashboard
        </a>
      </footer>
    </div>
  );
};

export default DepositPage;
