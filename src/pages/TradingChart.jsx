import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

const TradingChart = () => {
  const chartContainerRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const [interval, setInterval] = useState("1m");

  const binanceIntervals = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1w",
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // ✅ Create Chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 600,
      layout: { backgroundColor: "black", textColor: "white" },
      grid: { vertLines: { color: "#333" }, horzLines: { color: "#333" } },
      timeScale: { borderColor: "#555" },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candleSeriesRef.current = candleSeries;

    const fetchCandlestickData = async () => {
      const validInterval = binanceIntervals[interval];
      if (!validInterval) return;

      const url = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=${validInterval}&limit=1000`;
      console.log("Fetching initial data from:", url);

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Invalid Binance response:", data);
          return;
        }

        const formattedData = data.map(([time, open, high, low, close]) => ({
          time: time / 1000,
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
        }));

        candleSeries.setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCandlestickData();

    // ✅ Set up WebSocket for real-time updates
    const setupWebSocket = () => {
      if (wsRef.current) wsRef.current.close();

      const wsUrl = `wss://stream.binance.com:9443/ws/ethusdt@kline_${interval}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const json = JSON.parse(event.data);

        if (json.k) {
          const { t, o, h, l, c } = json.k; // Extract candlestick data
          const newCandle = {
            time: t / 1000,
            open: parseFloat(o),
            high: parseFloat(h),
            low: parseFloat(l),
            close: parseFloat(c),
          };

          candleSeries.update(newCandle);
        }
      };

      wsRef.current.onerror = (error) => console.error("WebSocket error:", error);
      wsRef.current.onclose = () => console.log("WebSocket closed.");
    };

    setupWebSocket();

    return () => {
      chart.remove();
      if (wsRef.current) wsRef.current.close();
    };
  }, [interval]);

  return (
    <div className="flex flex-col items-center bg-black p-4">
      <div className="flex space-x-2 mb-2">
        {Object.keys(binanceIntervals).map((timeframe) => (
          <button
            key={timeframe}
            className={`px-4 py-2 rounded ${interval === timeframe ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
            onClick={() => {
              console.log("Switching to interval:", timeframe);
              setInterval(timeframe);
            }}
          >
            {timeframe}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="w-full h-screen" />
    </div>
  );
};

export default TradingChart;