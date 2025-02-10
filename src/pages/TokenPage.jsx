import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { SearchIcon } from "@heroicons/react/solid";
import "chart.js/auto";
import TradingChart from "./TradingChart";

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/ethusdt@depth";

// Main App Component
const App = () => {
  const [orderBook, setOrderBook] = useState([]);
  const [marketTrades, setMarketTrades] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ label: "ETH Price", data: [], borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.2)" }],
  });
  const [price, setPrice] = useState(2750);
  const [amount, setAmount] = useState(0.1);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(BINANCE_WS_URL);
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateOrderBook(data);
    };
    return () => ws.current.close();
  }, []);

  const updateOrderBook = (data) => {
    const newOrders = data.bids.slice(0, 10).map(([price, amount]) => ({ price: parseFloat(price), amount: parseFloat(amount) }));
    setOrderBook(newOrders);
    setMarketTrades((prev) => [...prev, { price: newOrders[0].price, amount: newOrders[0].amount, type: "buy" }].slice(-10));
    setChartData((prev) => ({
      labels: [...prev.labels, newOrders[0].price].slice(-10),
      datasets: [{ label: "ETH Price", data: [...prev.datasets[0].data, newOrders[0].price].slice(-10), borderColor: "#3b82f6" }],
    }));
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-900 p-4">
        <h1 className="text-lg font-bold">Trading UI</h1>
        <div className="relative">
          <input type="text" placeholder="Search pairs..." className="bg-gray-800 p-2 rounded" />
          <SearchIcon className="h-5 w-5 absolute right-2 top-2 text-gray-400" />
        </div>
      </nav>

      <TradingChart/>


      {/* Trading Page Layout */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Chart */}

        {/* Order Book */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-lg">Order Book</h2>
          <ul>
            {orderBook.map((order, i) => (
              <li key={i} className="flex justify-between text-red-400">
                <span>${order.price.toFixed(2)}</span>
                <span>{order.amount} ETH</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {/* Market Trades */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-lg">Market Trades</h2>
          <ul>
            {marketTrades.map((trade, i) => (
              <li key={i} className={`flex justify-between ${trade.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                <span>${trade.price.toFixed(2)}</span>
                <span>{trade.amount} ETH</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trade Form */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-lg">Trade</h2>
          <div className="flex space-x-2 mt-2">
            <button className="bg-green-500 p-2 rounded w-1/2">Buy</button>
            <button className="bg-red-500 p-2 rounded w-1/2">Sell</button>
          </div>
          <div className="mt-2">
            <label className="block">Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 bg-gray-800 rounded" />
          </div>
          <div className="mt-2">
            <label className="block">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 bg-gray-800 rounded" />
          </div>
        </div>

        {/* Top Movers */}
        <div className="bg-gray-900 p-4 rounded">
          <h2 className="text-lg">Top Movers</h2>
          <ul>
            <li className="text-green-400 flex justify-between">
              <span>BTC/USDT</span>
              <span>+5.32%</span>
            </li>
            <li className="text-red-400 flex justify-between">
              <span>ETH/USDT</span>
              <span>-2.41%</span>
            </li>
            <li className="text-green-400 flex justify-between">
              <span>XRP/USDT</span>
              <span>+3.67%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
