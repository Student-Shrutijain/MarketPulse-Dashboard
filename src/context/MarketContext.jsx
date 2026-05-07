import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import socket from '../services/socket';

const MarketContext = createContext();

const API = '/api';

// Demo data for when API is unavailable
const DEMO_INDICES = {
  '^NSEI': { symbol: '^NSEI', name: 'NIFTY 50', price: 24380.25, change: 156.30, changePercent: 0.65, prevClose: 24223.95, sparkline: [24100, 24150, 24200, 24180, 24250, 24300, 24280, 24350, 24380] },
  '^BSESN': { symbol: '^BSESN', name: 'SENSEX', price: 80218.37, change: 520.90, changePercent: 0.65, prevClose: 79697.47, sparkline: [79700, 79800, 79900, 79850, 80000, 80100, 80050, 80200, 80218] },
  'GC=F': { symbol: 'GC=F', name: 'Gold (24K/10g)', price: 73450, change: 280, changePercent: 0.38, prevClose: 73170, sparkline: [73100, 73200, 73150, 73300, 73350, 73400, 73380, 73420, 73450] },
  'USDINR=X': { symbol: 'USDINR=X', name: 'USD / INR', price: 83.42, change: -0.15, changePercent: -0.18, prevClose: 83.57, sparkline: [83.60, 83.55, 83.50, 83.52, 83.48, 83.45, 83.43, 83.44, 83.42] },
  'EURINR=X': { symbol: 'EURINR=X', name: 'EUR / INR', price: 90.68, change: 0.22, changePercent: 0.24, prevClose: 90.46, sparkline: [90.40, 90.45, 90.50, 90.48, 90.55, 90.60, 90.58, 90.65, 90.68] },
  'GBPINR=X': { symbol: 'GBPINR=X', name: 'GBP / INR', price: 105.34, change: -0.41, changePercent: -0.39, prevClose: 105.75, sparkline: [105.80, 105.70, 105.60, 105.65, 105.50, 105.45, 105.40, 105.38, 105.34] },
};

const DEMO_GAINERS = [
  { symbol: 'TATAPOWER.NS', name: 'Tata Power', price: 425.60, change: 18.50, changePercent: 4.54, volume: 28500000 },
  { symbol: 'ADANIGREEN.NS', name: 'Adani Green', price: 1820.30, change: 72.15, changePercent: 4.13, volume: 12300000 },
  { symbol: 'IRFC.NS', name: 'IRFC', price: 168.25, change: 5.80, changePercent: 3.57, volume: 45000000 },
  { symbol: 'ZOMATO.NS', name: 'Zomato', price: 245.90, change: 8.10, changePercent: 3.41, volume: 32000000 },
  { symbol: 'PAYTM.NS', name: 'Paytm', price: 478.50, change: 14.20, changePercent: 3.06, volume: 18000000 },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', price: 985.40, change: 28.60, changePercent: 2.99, volume: 22000000 },
];

const DEMO_LOSERS = [
  { symbol: 'NYKAA.NS', name: 'Nykaa', price: 165.20, change: -8.40, changePercent: -4.84, volume: 15000000 },
  { symbol: 'DELHIVERY.NS', name: 'Delhivery', price: 412.30, change: -18.70, changePercent: -4.34, volume: 8000000 },
  { symbol: 'POLICYBZR.NS', name: 'PB Fintech', price: 1320.50, change: -52.30, changePercent: -3.81, volume: 6500000 },
  { symbol: 'IDEA.NS', name: 'Vodafone Idea', price: 12.85, change: -0.45, changePercent: -3.38, volume: 120000000 },
  { symbol: 'BIOCON.NS', name: 'Biocon', price: 268.90, change: -8.20, changePercent: -2.96, volume: 9500000 },
  { symbol: 'PNB.NS', name: 'PNB', price: 105.60, change: -2.90, changePercent: -2.67, volume: 35000000 },
];

const DEMO_ACTIVE = [
  { symbol: 'RELIANCE.NS', name: 'Reliance', price: 2945.80, change: 32.40, changePercent: 1.11, volume: 85000000 },
  { symbol: 'TCS.NS', name: 'TCS', price: 3890.25, change: -15.60, changePercent: -0.40, volume: 62000000 },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1625.40, change: 12.80, changePercent: 0.79, volume: 55000000 },
  { symbol: 'INFY.NS', name: 'Infosys', price: 1485.70, change: 22.30, changePercent: 1.52, volume: 48000000 },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1180.90, change: -8.40, changePercent: -0.71, volume: 42000000 },
  { symbol: 'SBIN.NS', name: 'SBI', price: 825.30, change: 6.20, changePercent: 0.76, volume: 38000000 },
];

const DEMO_NEWS = [
  { id: 1, title: 'Nifty 50 hits new all-time high as FII inflows surge', source: 'Economic Times', time: '15 min ago', sentiment: 'positive', category: 'stocks', verified: true },
  { id: 2, title: 'Gold prices rise on global uncertainty; ₹73,450 per 10g', source: 'Moneycontrol', time: '32 min ago', sentiment: 'neutral', category: 'commodities', verified: true },
  { id: 3, title: 'RBI keeps repo rate unchanged at 6.5% in latest policy review', source: 'CNBC-TV18', time: '1 hr ago', sentiment: 'neutral', category: 'economy', verified: true },
  { id: 4, title: 'Tata Power surges 4.5% on renewable energy expansion plans', source: 'Business Standard', time: '1 hr ago', sentiment: 'positive', category: 'stocks', verified: true },
  { id: 5, title: 'Rupee weakens against dollar amid crude oil price surge', source: 'Reuters', time: '2 hrs ago', sentiment: 'negative', category: 'forex', verified: true },
  { id: 6, title: 'IT sector under pressure; TCS, Infosys report muted Q4 guidance', source: 'Economic Times', time: '2 hrs ago', sentiment: 'negative', category: 'stocks', verified: false },
  { id: 7, title: 'Adani Group stocks rally after positive credit rating update', source: 'Moneycontrol', time: '3 hrs ago', sentiment: 'positive', category: 'stocks', verified: true },
  { id: 8, title: 'India GDP growth expected to remain above 7% in FY26', source: 'Business Standard', time: '3 hrs ago', sentiment: 'positive', category: 'economy', verified: true },
];

const SECTOR_DATA = [
  { name: 'IT', change: -1.2, value: 34500 },
  { name: 'Banking', change: 1.8, value: 52300 },
  { name: 'Pharma', change: 0.5, value: 18200 },
  { name: 'Auto', change: 2.1, value: 21800 },
  { name: 'Energy', change: 1.5, value: 41200 },
  { name: 'FMCG', change: -0.3, value: 16500 },
  { name: 'Metal', change: 3.2, value: 8900 },
  { name: 'Realty', change: -2.1, value: 6200 },
  { name: 'Infra', change: 0.9, value: 7800 },
  { name: 'Media', change: -0.8, value: 2100 },
  { name: 'PSU Bank', change: 2.5, value: 9800 },
  { name: 'Fin Service', change: 1.1, value: 22400 },
];

export function MarketProvider({ children }) {
  const [indices, setIndices] = useState(DEMO_INDICES);
  const [gainers, setGainers] = useState(DEMO_GAINERS);
  const [losers, setLosers] = useState(DEMO_LOSERS);
  const [mostActive, setMostActive] = useState(DEMO_ACTIVE);
  const [news, setNews] = useState(DEMO_NEWS);
  const [sectors, setSectors] = useState(SECTOR_DATA);
  const [marketStatus, setMarketStatus] = useState('open');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);       // background refresh indicator
  const [initialLoading, setInitialLoading] = useState(true); // only true on very first load
  const priceFlash = useRef({});
  const hasFetched = useRef(false);

  // Connect to real-time socket and listen for price updates
  useEffect(() => {
    // When the data is fetched, subscribe to all symbols we have
    const allSymbols = [
      ...Object.keys(indices),
      ...gainers.map(g => g.symbol),
      ...losers.map(l => l.symbol),
      ...mostActive.map(m => m.symbol)
    ];
    if (allSymbols.length > 0) {
      socket.emit('subscribe', allSymbols);
    }

    const handlePriceUpdate = (updates) => {
      // Updates indices
      setIndices(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(key => {
          if (updates[key]) {
            changed = true;
            const item = { ...updated[key] };
            const newPrice = updates[key].price;
            item.flashDirection = newPrice > item.price ? 'up' : newPrice < item.price ? 'down' : item.flashDirection;
            item.prevPrice = item.price;
            item.price = newPrice;
            item.change = updates[key].change;
            item.changePercent = updates[key].changePercent;
            item.sparkline = [...item.sparkline.slice(1), item.price];
            updated[key] = item;
          }
        });
        return changed ? updated : prev;
      });

      // Helper to update a list (gainers, losers, mostActive)
      const updateList = (list) => {
        let changed = false;
        const newList = list.map(item => {
          if (updates[item.symbol]) {
            changed = true;
            const newPrice = updates[item.symbol].price;
            return {
              ...item,
              prevPrice: item.price,
              price: newPrice,
              change: updates[item.symbol].change,
              changePercent: updates[item.symbol].changePercent,
              flashDirection: newPrice > item.price ? 'up' : newPrice < item.price ? 'down' : item.flashDirection,
            };
          }
          return item;
        });
        return changed ? newList : list;
      };

      setGainers(prev => updateList(prev));
      setLosers(prev => updateList(prev));
      setMostActive(prev => updateList(prev));
      setLastUpdated(new Date());
    };

    socket.on('price-update', handlePriceUpdate);

    return () => {
      socket.off('price-update', handlePriceUpdate);
      if (allSymbols.length > 0) {
        socket.emit('unsubscribe', allSymbols);
      }
    };
  }, [indices, gainers, losers, mostActive]);

  const fetchMarketData = useCallback(async () => {
    // Only show background spinner on re-fetches, not initial
    if (hasFetched.current) setLoading(true);
    try {
      const [marketRes, newsRes] = await Promise.all([
        axios.get(`${API}/market/overview`).catch(() => ({ data: {} })),
        axios.get(`${API}/news`).catch(() => ({ data: [] }))
      ]);

      const data = marketRes.data;
      if (data.indices) setIndices(prev => mergeWithSparklines(prev, data.indices));
      if (data.gainers) setGainers(data.gainers);
      if (data.losers) setLosers(data.losers);
      if (data.mostActive) setMostActive(data.mostActive);
      if (data.sectors) setSectors(data.sectors);

      if (newsRes.data && newsRes.data.length > 0) {
        setNews(newsRes.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch market data', err);
      // Keep showing demo data on failure
    } finally {
      setLoading(false);
      setInitialLoading(false);
      hasFetched.current = true;
    }
  }, []);

  // Helper: merge live prices while keeping sparklines for animation
  function mergeWithSparklines(prev, live) {
    const merged = { ...prev };
    Object.keys(live).forEach(key => {
      const existing = prev[key] || {};
      merged[key] = {
        ...live[key],
        sparkline: existing.sparkline || [live[key].price],
      };
    });
    return merged;
  }

  // Fetch real data on mount!
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return (
    <MarketContext.Provider value={{
      indices, gainers, losers, mostActive, news, sectors,
      marketStatus, lastUpdated, loading, initialLoading,
      fetchMarketData, setNews
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => useContext(MarketContext);
