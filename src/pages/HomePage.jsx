import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
        );
        const data = await response.json();

        setCryptocurrencies(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  return (
    <main className="flex-grow p-8 mx-auto bg-gray-900 text-white min-h-screen">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-yellow-400 mb-6 tracking-wide drop-shadow-lg">
          Welcome to TradeInSec
        </h2>
        <p className="text-3xl text-gray-300 mb-8 font-medium leading-relaxed max-w-4xl mx-auto">
          Discover the top-performing{" "}
          <a href="/cryptocurrencies" className="text-yellow-400 hover:underline">
            Cryptocurrencies
          </a>
          , monitor live prices, and make informed decisions to manage your investments efficiently.
        </p>
      </div>

      {/* Cryptocurrencies Section */}
      <section className="bg-gray-900 shadow-lg rounded-2xl p-10 mb-12 space-y-8">
        <h2 className="text-5xl font-semibold text-yellow-400 mb-6 text-center">Top Cryptocurrencies</h2>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border text-yellow-400 animate-spin w-16 h-16 border-4 border-t-4 border-yellow-400 rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {cryptocurrencies.length > 0 ? (
              cryptocurrencies.map((crypto) => (
                <div
                  key={crypto.id}
                  className="bg-gray-800 p-4 rounded-3xl shadow-2xl transform transition-all hover:scale-105 hover:shadow-2xl hover:rotate-3 hover:bg-black duration-300"
                >
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-24 h-24 mx-auto mb-6 rounded-full border-yellow-400 shadow-lg"
                  />
                  <h3 className="text-2xl font-semibold text-yellow-400 mb-3 transition-all duration-200 hover:text-white">
                    {crypto.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">{crypto.symbol.toUpperCase()}</p>
                  <p className="text-lg font-medium text-white">
                    ${crypto.current_price.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="items-center text-gray-400">No cryptocurrencies available</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;