const express = require('express');
const router = express.Router();

const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// GET /api/news — general market news
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'India stock market NSE';
    if (category && category !== 'all') query = `finance ${category}`;

    const searchResult = await yahooFinance.search(query, { newsCount: 15 });
    const news = searchResult.news.map((n, index) => ({
      id: n.uuid || index,
      title: n.title,
      source: n.publisher || 'Yahoo Finance',
      time: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString() : new Date().toISOString(),
      sentiment: 'neutral',
      category: category && category !== 'all' ? category : 'finance',
      verified: true,
      url: n.link
    }));

    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/:symbol — symbol-specific real-time news
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    // Search by both the symbol and the company name for better results
    const searchResult = await yahooFinance.search(symbol, { newsCount: 15 });

    const news = (searchResult.news || []).map((n, index) => ({
      id: n.uuid || index,
      title: n.title,
      source: n.publisher || 'Yahoo Finance',
      time: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString() : new Date().toISOString(),
      sentiment: 'neutral',
      verified: true,
      url: n.link,
      thumbnail: n.thumbnail?.resolutions?.[0]?.url || null,
    }));

    res.json(news);
  } catch (error) {
    console.error(`Error fetching news for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch stock news' });
  }
});

module.exports = router;
