const express = require('express');
const router = express.Router();

const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

// GET /api/market/overview
router.get('/overview', async (req, res) => {
  try {
    const symbols = ['^NSEI', '^BSESN', 'GC=F', 'USDINR=X'];
    const quotes = await yahooFinance.quote(symbols);
    
    const indices = {};
    quotes.forEach(quote => {
      indices[quote.symbol] = {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        prevClose: quote.regularMarketPreviousClose,
      };
    });

    res.json({
      indices,
      marketStatus: 'open',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
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

module.exports = router;
