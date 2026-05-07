import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import socket from '../services/socket';

const PortfolioContext = createContext();
const API = '/api';

export function PortfolioProvider({ children }) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [holdings, setHoldings] = useState([]);

  const totalInvested = holdings.reduce((sum, h) => sum + h.qty * h.avgPrice, 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + h.qty * h.currentPrice, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

  const fetchPortfolio = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setHoldings([]);
      return;
    }
    try {
      const { data } = await axios.get(`${API}/portfolio`);
      setWatchlist(data.watchlist || []);
      setHoldings(data.holdings || []);
    } catch (err) {
      console.error('Failed to fetch portfolio', err);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Connect to socket and update holdings/watchlist live
  useEffect(() => {
    const allSymbols = [
      ...watchlist.map(w => w.symbol),
      ...holdings.map(h => h.symbol)
    ];

    if (allSymbols.length > 0) {
      socket.emit('subscribe', allSymbols);

      const handlePriceUpdate = (updates) => {
          setWatchlist(prev => {
            let changed = false;
            const updated = prev.map(w => {
              if (updates[w.symbol]) {
                changed = true;
                return {
                  ...w,
                  price: updates[w.symbol].price,
                  change: updates[w.symbol].change,
                  changePercent: updates[w.symbol].changePercent,
                };
              }
              return w;
            });
            return changed ? updated : prev;
          });

          setHoldings(prev => {
            let changed = false;
            const updated = prev.map(h => {
              if (updates[h.symbol]) {
                changed = true;
                return { ...h, currentPrice: updates[h.symbol].price };
              }
              return h;
            });
            return changed ? updated : prev;
          });
        };

        socket.on('price-update', handlePriceUpdate);

        return () => {
        socket.off('price-update', handlePriceUpdate);
        socket.emit('unsubscribe', allSymbols);
      };
    }
  }, [watchlist, holdings]);

  const addToWatchlist = useCallback(async (stock) => {
    try {
      if (!user) {
        alert('Please log in to add items to your Watchlist.');
        return;
      }
      const { data } = await axios.post(`${API}/portfolio/watchlist`, {
        symbol: stock.symbol
      });
      setWatchlist(data.watchlist || []);
    } catch (err) {
      console.error('Failed to add to watchlist', err);
    }
  }, [user]);

  const removeFromWatchlist = useCallback(async (symbol) => {
    try {
      if (!user) {
        alert('Please log in to modify your Watchlist.');
        return;
      }
      const { data } = await axios.delete(`${API}/portfolio/watchlist/${encodeURIComponent(symbol)}`);
      setWatchlist(data.watchlist || []);
    } catch (err) {
      console.error('Failed to remove from watchlist', err);
    }
  }, [user]);

  const addHolding = useCallback(async (holding) => {
    try {
      if (!user) {
        alert('Please log in to add items to your Portfolio Holdings.');
        return;
      }
      const { data } = await axios.post(`${API}/portfolio/holdings`, {
        symbol: holding.symbol,
        qty: holding.qty,
        avgPrice: holding.avgPrice
      });
      setHoldings(data.holdings || []);
    } catch (err) {
      console.error('Failed to add holding', err);
    }
  }, [user]);

  const removeHolding = useCallback(async (symbol) => {
    try {
      if (!user) {
        alert('Please log in to modify your Portfolio Holdings.');
        return;
      }
      const { data } = await axios.delete(`${API}/portfolio/holdings/${encodeURIComponent(symbol)}`);
      setHoldings(data.holdings || []);
    } catch (err) {
      console.error('Failed to remove holding', err);
    }
  }, [user]);

  const updateHolding = useCallback(async (symbol, updates) => {
    // Currently updating a holding isn't implemented in the backend,
    // so we'll just optimistically update the state for now, 
    // or remove and re-add in the backend in a full implementation.
    setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, ...updates } : h));
  }, []);

  return (
    <PortfolioContext.Provider value={{
      watchlist, holdings,
      totalInvested, totalCurrent, totalPnL, totalPnLPercent,
      addToWatchlist, removeFromWatchlist,
      addHolding, removeHolding, updateHolding,
      setHoldings, setWatchlist // Expose setters for socket.io updates later
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);
