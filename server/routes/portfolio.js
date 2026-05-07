const express = require('express');
const router = express.Router();
const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const Portfolio = require('../models/Portfolio');
const authMiddleware = require('../middleware/auth');

// GET /api/portfolio
// Get user's portfolio and watchlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user.id, watchlist: [], holdings: [] });
    }
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});

// POST /api/portfolio/watchlist
router.post('/watchlist', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.body;
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user.id, watchlist: [], holdings: [] });
    }

    // Check if already exists
    if (portfolio.watchlist.find(w => w.symbol === symbol)) {
      return res.json(portfolio);
    }

    // Fetch real-time data
    const quote = await yahooFinance.quote(symbol);
    const newItem = {
      symbol,
      name: quote.shortName || quote.longName || symbol.replace('.NS', ''),
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0
    };

    portfolio.watchlist.push(newItem);
    await portfolio.save();
    res.json(portfolio);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// DELETE /api/portfolio/watchlist/:symbol
router.delete('/watchlist/:symbol', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (portfolio) {
      portfolio.watchlist = portfolio.watchlist.filter(w => w.symbol !== req.params.symbol);
      await portfolio.save();
    }
    res.json(portfolio);
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// POST /api/portfolio/holdings
router.post('/holdings', authMiddleware, async (req, res) => {
  try {
    const { symbol, qty, avgPrice } = req.body;
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user.id, watchlist: [], holdings: [] });
    }

    // Fetch real-time price
    const quote = await yahooFinance.quote(symbol);
    const currentPrice = quote.regularMarketPrice || avgPrice;

    portfolio.holdings.push({ 
      symbol, 
      name: quote.shortName || symbol.replace('.NS', ''), 
      qty, 
      avgPrice, 
      currentPrice 
    });
    await portfolio.save();
    
    res.json(portfolio);
  } catch (error) {
    console.error('Error adding holding:', error);
    res.status(500).json({ error: 'Failed to add holding' });
  }
});

// DELETE /api/portfolio/holdings/:symbol
router.delete('/holdings/:symbol', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (portfolio) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== req.params.symbol);
      await portfolio.save();
    }
    res.json(portfolio);
  } catch (error) {
    console.error('Error removing holding:', error);
    res.status(500).json({ error: 'Failed to remove holding' });
  }
});

module.exports = router;
