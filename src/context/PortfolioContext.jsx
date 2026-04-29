import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PortfolioContext = createContext();
const API = '/api';

const DEMO_WATCHLIST = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2945.80, change: 32.40, changePercent: 1.11 },
  { symbol: 'TCS.NS', name: 'Tata Consultancy', price: 3890.25, change: -15.60, changePercent: -0.40 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1625.40, change: 12.80, changePercent: 0.79 },
  { symbol: 'INFY.NS', name: 'Infosys', price: 1485.70, change: 22.30, changePercent: 1.52 },
];

const DEMO_HOLDINGS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance', qty: 10, avgPrice: 2800, currentPrice: 2945.80 },
  { symbol: 'TCS.NS', name: 'TCS', qty: 5, avgPrice: 3950, currentPrice: 3890.25 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', qty: 15, avgPrice: 1580, currentPrice: 1625.40 },
  { symbol: 'INFY.NS', name: 'Infosys', qty: 20, avgPrice: 1420, currentPrice: 1485.70 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', qty: 12, avgPrice: 1150, currentPrice: 1180.90 },
];

export function PortfolioProvider({ children }) {
  const [watchlist, setWatchlist] = useState(DEMO_WATCHLIST);
  const [holdings, setHoldings] = useState(DEMO_HOLDINGS);

  const totalInvested = holdings.reduce((sum, h) => sum + h.qty * h.avgPrice, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.qty * h.currentPrice, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

  const addToWatchlist = useCallback((stock) => {
    setWatchlist(prev => {
      if (prev.find(w => w.symbol === stock.symbol)) return prev;
      return [...prev, stock];
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol) => {
    setWatchlist(prev => prev.filter(w => w.symbol !== symbol));
  }, []);

  const addHolding = useCallback((holding) => {
    setHoldings(prev => [...prev, holding]);
  }, []);

  const removeHolding = useCallback((symbol) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
  }, []);

  const updateHolding = useCallback((symbol, updates) => {
    setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, ...updates } : h));
  }, []);

  // Simulate live price updates for holdings
  useEffect(() => {
    const interval = setInterval(() => {
      setHoldings(prev => prev.map(h => {
        const delta = (Math.random() - 0.48) * h.currentPrice * 0.001;
        return { ...h, currentPrice: +(h.currentPrice + delta).toFixed(2) };
      }));
      setWatchlist(prev => prev.map(w => {
        const delta = (Math.random() - 0.48) * w.price * 0.001;
        const newPrice = +(w.price + delta).toFixed(2);
        const newChange = +(w.change + delta).toFixed(2);
        return {
          ...w,
          price: newPrice,
          change: newChange,
          changePercent: +((newChange / (newPrice - newChange)) * 100).toFixed(2)
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PortfolioContext.Provider value={{
      watchlist, holdings,
      totalInvested, totalCurrent, totalPnL, totalPnLPercent,
      addToWatchlist, removeFromWatchlist,
      addHolding, removeHolding, updateHolding,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);
