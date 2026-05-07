const express = require('express');
const router = express.Router();

const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// NSE stocks pool used to derive real movers
const NSE_POOL = [
  'RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ICICIBANK.NS','SBIN.NS',
  'BHARTIARTL.NS','BAJFINANCE.NS','WIPRO.NS','TATAMOTORS.NS','HCLTECH.NS',
  'AXISBANK.NS','ADANIENT.NS','MARUTI.NS','LT.NS','SUNPHARMA.NS','NTPC.NS',
  'ONGC.NS','POWERGRID.NS','ULTRACEMCO.NS','TITAN.NS','NESTLEIND.NS',
  'BAJAJFINSV.NS','TECHM.NS','DIVISLAB.NS','JSWSTEEL.NS','TATACONSUM.NS',
  'HINDALCO.NS','GRASIM.NS','COALINDIA.NS','INDUSINDBK.NS','EICHERMOT.NS',
  'HEROMOTOCO.NS','BPCL.NS','DRREDDY.NS','CIPLA.NS','SBILIFE.NS',
  'TATAPOWER.NS','ZOMATO.NS','IRFC.NS'
];

// GET /api/market/overview
router.get('/overview', async (req, res) => {
  try {
    const SECTOR_PROXIES = {
      'Banking': 'BANKBEES.NS',
      'IT': 'ITBEES.NS',
      'Pharma': 'PHARMABEES.NS',
      'Auto': 'AUTOBEES.NS',
      'FMCG': 'FMCGBEES.NS',
      'Energy/PSU': 'CPSEETF.NS',
      'Gold': 'GOLDBEES.NS',
      'Midcap': 'MID150BEES.NS'
    };

    const sectorSymbols = Object.values(SECTOR_PROXIES);

    const [indiceQuotes, moverQuotes, sectorQuotes] = await Promise.all([
      yahooFinance.quote(['^NSEI', '^BSESN', 'GC=F', 'USDINR=X', 'EURINR=X', 'GBPINR=X']).catch(e => { console.error('Indices fetch failed:', e.message); return []; }),
      yahooFinance.quote(NSE_POOL).catch(e => { console.error('Movers fetch failed:', e.message); return []; }),
      yahooFinance.quote(sectorSymbols).catch(e => { console.error('Sectors fetch failed:', e.message); return []; })
    ]);

    if (indiceQuotes.length === 0 && moverQuotes.length === 0) {
      console.warn('Yahoo Finance returned no data. Check for rate limits or region blocks.');
    }

    // Build indices map
    const indices = {};
    indiceQuotes.forEach(q => {
      indices[q.symbol] = {
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        prevClose: q.regularMarketPreviousClose,
      };
    });

    // Normalize movers
    const stocks = moverQuotes.map(q => ({
      symbol: q.symbol,
      name: q.shortName || q.symbol.replace('.NS', ''),
      price: +(q.regularMarketPrice || 0).toFixed(2),
      change: +(q.regularMarketChange || 0).toFixed(2),
      changePercent: +(q.regularMarketChangePercent || 0).toFixed(2),
      volume: q.regularMarketVolume || 0,
    }));

    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const gainers   = sorted.slice(0, 6);
    const losers    = sorted.slice(-6).reverse();
    const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 6);

    // Build sectors array
    const sectorMap = {};
    sectorQuotes.forEach(q => {
      sectorMap[q.symbol] = q;
    });

    const sectors = Object.keys(SECTOR_PROXIES).map(name => {
      const symbol = SECTOR_PROXIES[name];
      const q = sectorMap[symbol];
      return {
        name,
        change: q ? +(q.regularMarketChangePercent || 0).toFixed(2) : 0,
        value: q ? +(q.regularMarketVolume || 0) : 0, // Using volume as heatmap size indicator
      };
    });

    res.json({ indices, gainers, losers, mostActive, sectors, marketStatus: 'open', lastUpdated: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// GET /api/market/search?q=query — live symbol search for navbar
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) return res.json([]);

    const result = await yahooFinance.search(q, { quotesCount: 8, newsCount: 0 });
    const quotes = (result.quotes || [])
      .filter(r => r.symbol && (r.quoteType === 'EQUITY' || r.quoteType === 'INDEX' || r.quoteType === 'ETF'))
      .map(r => ({
        symbol: r.symbol,
        name: r.longname || r.shortname || r.symbol,
        exchange: r.exchDisp || r.exchange || '',
        type: r.quoteType,
      }));

    res.json(quotes);
  } catch (error) {
    console.error('Search error:', error.message);
    res.json([]);
  }
});

// GET /api/market/quote/:symbol
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);
    
    res.json({
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      week52High: quote.fiftyTwoWeekHigh,
      week52Low: quote.fiftyTwoWeekLow,
    });
  } catch (error) {
    console.error('Error fetching quote for', req.params.symbol, error);
    res.status(500).json({ error: 'Failed to fetch quote data' });
  }
});

// GET /api/market/history/:symbol
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1M' } = req.query;
    
    const now = new Date();
    let period1 = new Date();
    let interval = '1d';
    
    switch (range) {
      case '1D':
        period1.setDate(now.getDate() - 1);
        interval = '5m';
        break;
      case '5D':
        period1.setDate(now.getDate() - 5);
        interval = '15m';
        break;
      case '1M':
        period1.setMonth(now.getMonth() - 1);
        interval = '1d';
        break;
      case '3M':
        period1.setMonth(now.getMonth() - 3);
        interval = '1d';
        break;
      case '6M':
        period1.setMonth(now.getMonth() - 6);
        interval = '1d';
        break;
      case '1Y':
        period1.setFullYear(now.getFullYear() - 1);
        interval = '1d';
        break;
      default:
        period1.setMonth(now.getMonth() - 1);
        interval = '1d';
    }
    
    const result = await yahooFinance.chart(symbol, {
      period1,
      interval,
    });
    
    const data = result.quotes.map(q => ({
      date: q.date.toISOString(),
      open: +(q.open || 0).toFixed(2),
      high: +(q.high || 0).toFixed(2),
      low: +(q.low || 0).toFixed(2),
      close: +(q.close || 0).toFixed(2),
      volume: q.volume || 0,
    })).filter(q => q.close > 0);

    res.json({ symbol, range, data });
  } catch (error) {
    console.error('Error fetching history for', req.params.symbol, error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// GET /api/market/quotes?symbols=...
router.get('/quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) return res.json([]);
    const symbolArray = symbols.split(',').filter(s => s.trim().length > 0);
    if (symbolArray.length === 0) return res.json([]);
    
    const quotes = await yahooFinance.quote(symbolArray);
    const result = quotes.map(q => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol.replace('.NS', ''),
      price: +(q.regularMarketPrice || 0).toFixed(2),
      change: +(q.regularMarketChange || 0).toFixed(2),
      changePercent: +(q.regularMarketChangePercent || 0).toFixed(2),
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching bulk quotes:', error);
    res.status(500).json({ error: 'Failed to fetch bulk quotes' });
  }
});

// GET /api/market/performance
router.get('/performance', async (req, res) => {
  try {
    const indices = [
      { symbol: '^NSEI', name: 'NIFTY 50' },
      { symbol: '^BSESN', name: 'SENSEX' },
      { symbol: 'BANKBEES.NS', name: 'NIFTY Bank' },
      { symbol: 'ITBEES.NS', name: 'NIFTY IT' },
      { symbol: 'GOLDBEES.NS', name: 'Gold' }
    ];

    const results = await Promise.all(
      indices.map(async (idx) => {
        try {
          const chart = await yahooFinance.chart(idx.symbol, { range: '1y', interval: '1d' });
          const quotes = chart.quotes.filter(q => q.close > 0);
          if (quotes.length === 0) throw new Error('No data');

          const latest = quotes[quotes.length - 1].close;
          
          const getChange = (daysAgo) => {
            const pastQuote = quotes[Math.max(0, quotes.length - 1 - daysAgo)];
            if (!pastQuote) return 'N/A';
            const change = ((latest - pastQuote.close) / pastQuote.close) * 100;
            return (change > 0 ? '+' : '') + change.toFixed(2) + '%';
          };

          return {
            name: idx.name,
            '1D': getChange(1),
            '1W': getChange(5), // approx 5 trading days
            '1M': getChange(21), // approx 21 trading days
            '3M': getChange(63), // approx 63 trading days
            '6M': getChange(126), // approx 126 trading days
            '1Y': getChange(252), // approx 252 trading days
          };
        } catch (e) {
          return {
            name: idx.name,
            '1D': 'N/A', '1W': 'N/A', '1M': 'N/A', '3M': 'N/A', '6M': 'N/A', '1Y': 'N/A'
          };
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

module.exports = router;
