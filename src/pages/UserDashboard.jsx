import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { depositCrypto } from "../utils/deposit-crypto/depositCrypto";
import { useNavigate, useLocation } from 'react-router-dom';
import CryptocurrencyTable from "../components/CryptocurrencyTable";
import { fetchUserData } from "../api/user";
import { fetchCryptocurrencies } from "../api/cryptocurrencies";

const UserDashboard = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [usdBalance, setUsdBalance] = useState(0);
  const [tokens, setTokens] = useState([
    { name: "Ethereum", symbol: "ETH", amount: 1.5, price: 2300 },
    { name: "Bitcoin", symbol: "BTC", amount: 0.2, price: 92000 },
    { name: "Solana", symbol: "SOL", amount: 20, price: 200 },
    { name: "Binance Coin", symbol: "BNB", amount: 5, price: 721 },
    { name: "Polygon", symbol: "MATIC", amount: 100, price: 0.451 },
    { name: "Cardano", symbol: "ADA", amount: 250, price: 1 },
    { name: "Dogecoin", symbol: "DOGE", amount: 10000, price: 0.45 },
    { name: "Litecoin", symbol: "LTC", amount: 2, price: 400 },
    { name: "Chainlink", symbol: "LINK", amount: 50, price: 23.45 },
    { name: "Avalanche", symbol: "AVAX", amount: 12, price: 45.32 }
  ]);
  const [orderHistory, setOrderHistory] = useState([
    { id: 1, crypto: "BTC", amount: 0.5, price: 50000, date: "01/01/2024" },
    { id: 2, crypto: "ETH", amount: 2, price: 2500, date: "02/01/2024" },
    { id: 3, crypto: "SOL", amount: 10, price: 150, date: "03/01/2024" },
    { id: 4, crypto: "BNB", amount: 3, price: 400, date: "04/01/2024" },
    { id: 5, crypto: "ADA", amount: 200, price: 1.2, date: "05/01/2024" },
    { id: 6, crypto: "DOGE", amount: 5000, price: 0.3, date: "06/01/2024" },
    { id: 7, crypto: "MATIC", amount: 50, price: 2, date: "07/01/2024" },
    { id: 8, crypto: "LTC", amount: 5, price: 200, date: "08/01/2024" },
    { id: 9, crypto: "LINK", amount: 15, price: 25, date: "09/01/2024" },
    { id: 10, crypto: "AVAX", amount: 8, price: 90, date: "10/01/2024" }
  ]);
  
  const [openOrders, setOpenOrders] = useState([
    { id: 11, crypto: "BTC", amount: 0.1, price: 60000 },
    { id: 12, crypto: "ETH", amount: 3, price: 2400 },
    { id: 13, crypto: "SOL", amount: 5, price: 160 },
    { id: 14, crypto: "BNB", amount: 2, price: 410 },
    { id: 15, crypto: "ADA", amount: 300, price: 1.3 },
    { id: 16, crypto: "DOGE", amount: 6000, price: 0.25 },
    { id: 17, crypto: "MATIC", amount: 70, price: 1.8 },
    { id: 18, crypto: "LTC", amount: 3, price: 190 },
    { id: 19, crypto: "LINK", amount: 20, price: 23 },
    { id: 20, crypto: "AVAX", amount: 10, price: 85 }
  ]);
  const [amount, setAmount] = useState("");
  const [cryptocurrencies, setCryptocurrencies] = useState([
    { name: "Ethereum", symbol: "ETH", amount: 1.5, chains: [{ chain_name: "ETHEREUM" }, { chain_name: "SOLANA" }, { chain_name: "POLYGON" }, { chain_name: "BSC" }] },
    { name: "Bitcoin", symbol: "BTC", amount: 0.2, chains: [{ chain_name: "BITCOIN" }] },
    { name: "Solana", symbol: "SOL", amount: 20, chains: [{ chain_name: "SOLANA" }] },
    { name: "Binance Coin", symbol: "BNB", amount: 5, chains: [{ chain_name: "BSC" }] },
    { name: "Polygon", symbol: "MATIC", amount: 100, chains: [{ chain_name: "POLYGON" }] },
    { name: "Cardano", symbol: "ADA", amount: 250, chains: [{ chain_name: "CARDANO" }] },
    { name: "Dogecoin", symbol: "DOGE", amount: 10000, chains: [{ chain_name: "DOGECOIN" }] },
    { name: "Litecoin", symbol: "LTC", amount: 2, chains: [{ chain_name: "LITECOIN" }] },
    { name: "Chainlink", symbol: "LINK", amount: 50, chains: [{ chain_name: "ETHEREUM" }] },
    { name: "Avalanche", symbol: "AVAX", amount: 12, chains: [{ chain_name: "AVALANCHE" }] }
  ]);
  const [activeSection, setActiveSection] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });


  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...cryptocurrencies].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setCryptocurrencies(sortedData);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
    } else {
      const getUserData = async () => {
        try {
          const data = await fetchUserData(userId, token);

          if (data.status === 'success' && data.data.user) {
            const user = data.data.user;
            setUser({
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              email: user.email || '',
            });

            const wallet = data.data.wallet;
            // setUsdBalance(wallet.usd_balance || 0);
            // setTokens(data.data.ownedTokens || []);
            // setOrderHistory(data.data.orderHistory || []);
            // setOpenOrders(data.data.openOrders || []);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      getUserData();
    }
  }, [navigate]);
  
  
  useEffect(() => {
    const getCryptocurrencies = async () => {
      try {
        const data = await fetchCryptocurrencies();
        if (data.status === 'success') {
          // setCryptocurrencies(data.cryptos || []);
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    };

    getCryptocurrencies();
  }, []);

  useEffect(() => {
    const section = location.hash.replace("#", "");
    if (section) {
      setActiveSection(section);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  }
    const handleSectionChange = (section) => {
      setActiveSection(section);
    };
  
    return (
      <div className="min-h-screen flex bg-black">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col">
          <a href={"/"} className="text-2xl font-semibold text-yellow-400">
            TradeInSec
          </a>
          <nav className="mt-8 flex-1">
            <ul className="space-y-4">
              {[
                { id: "my-tokens", label: "My Tokens" },
                { id: "open-orders", label: "Open Orders" },
                { id: "order-history", label: "Order History" },
                { id: "settings", label: "Settings" },
              ].map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => handleSectionChange(item.id)}
                    className={`block px-4 py-2 rounded transition-colors ${
                      activeSection === item.id
                        ? "bg-yellow-400 text-black font-bold"
                        : "hover:bg-gray-700 hover:text-yellow-400"
                    }`}
                    aria-current={activeSection === item.id ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            onClick={handleLogout}
            className="mt-auto w-full px-4 py-2 bg-red-600 hover:bg-red-700 transition-all duration-200 text-white rounded"
          >
            Logout
          </button>
        </aside>
    
        {/* Main Content Area */}
        <div className="flex-1 bg-gray-900 p-8 overflow-auto">
          <div className="space-y-8">
            {/* User Info Section */}
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-yellow-400">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-300">Email: {user.email}</p>
            </div>
    
            {/* USD Balance */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center justify-between border border-gray-700">
              <div>
                <h3 className="text-xl font-medium text-gray-300">USD Balance</h3>
                <p className="text-2xl font-bold text-white">${usdBalance.toFixed(2)}</p>
              </div>
              <div className="space-x-4">
                <a
                  href={"/deposit"}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all ease-in-out duration-300 transform hover:scale-105"
                >
                  Deposit
                </a>
                <a
                  href={"/withdraw"}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition-all ease-in-out duration-300 transform hover:scale-105"
                >
                  Withdraw
                </a>
              </div>
            </div>
            {/* <CryptocurrencyTable cryptocurrencies={cryptocurrencies} handleSort={handleSort}/> */}
    
            {/* My Tokens Section */}
            {activeSection === "my-tokens" && (
              <SectionContainer title="My Tokens">
                <StyledTable
                  headers={["Token Name", "Symbol", "Amount"]}
                  data={tokens.map((token) => [token.name, token.symbol, token.amount])}
                />
              </SectionContainer>
            )}
    
            {/* Open Orders Section */}
            {activeSection === "open-orders" && (
              <SectionContainer title="Open Orders">
                <StyledTable
                  headers={["Order ID", "Crypto", "Amount", "Price"]}
                  data={openOrders.map((order) => [
                    order.id,
                    order.crypto,
                    order.amount,
                    order.price,
                  ])}
                />
              </SectionContainer>
            )}
    
            {/* Order History Section */}
            {activeSection === "order-history" && (
              <SectionContainer title="Order History">
                <StyledTable
                  headers={["Order ID", "Crypto", "Amount", "Price", "Date"]}
                  data={orderHistory.map((order) => [
                    order.id,
                    order.crypto,
                    order.amount,
                    order.price,
                    order.date,
                  ])}
                />
              </SectionContainer>
            )}
    
            {/* Settings Section */}
            {activeSection === "settings" && (
              <SectionContainer title="Settings">
                <p className="text-gray-400">Configure your preferences here.</p>
              </SectionContainer>
            )}
          </div>
        </div>
      </div>
    );
    

  
};

export default UserDashboard;


// Reusable Section Component
const SectionContainer = ({ title, children }) => (
  <div className="mt-8">
    <h2 className="text-2xl font-semibold text-yellow-400 mb-4">{title}</h2>
    {children}
  </div>
);

// Reusable Styled Table Component
const StyledTable = ({ headers, data }) => (
  <div className="min-h-screen bg-black text-white flex justify-center">
    <div className="w-full max-w-6xl bg-gray-900 p-6 rounded-lg shadow-lg overflow-auto">
      <table className="w-full mt-4 border-collapse text-sm">
        <thead>
          <tr className="text-gray-400 bg-gray-800 border-b border-gray-700">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left cursor-pointer"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-800 hover:bg-gray-800"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-3 text-white"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-3 text-center text-gray-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);