const express = require('express');
const router = express.Router();
const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const authMiddleware = require('../middleware/auth');
const News = require('../models/News');

// GET /api/news — general market news
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'India stock market NSE';
    if (category && category !== 'all') query = `finance ${category}`;

    const [searchResult, dbNews] = await Promise.all([
      yahooFinance.search(query, { newsCount: 15 }),
      News.find({ status: 'approved' }).sort({ publishedAt: -1 }).limit(10)
    ]);

    const yahooNews = searchResult.news.map((n, index) => ({
      id: n.uuid || index,
      title: n.title,
      source: n.publisher || 'Yahoo Finance',
      time: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString() : new Date().toISOString(),
      sentiment: 'neutral',
      category: category && category !== 'all' ? category : 'finance',
      verified: true,
      url: n.link
    }));

    const formattedDbNews = dbNews.map(n => ({
      id: n._id,
      title: n.title,
      source: n.source,
      time: n.publishedAt ? n.publishedAt.toISOString() : n.createdAt.toISOString(),
      sentiment: 'neutral',
      category: 'User Submitted',
      verified: true,
      url: n.url || '#',
      isLocal: true,
      content: n.content
    }));

    res.json([...formattedDbNews, ...yahooNews]);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/:symbol — symbol-specific real-time news
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const [searchResult, dbNews] = await Promise.all([
      yahooFinance.search(symbol, { newsCount: 15 }),
      News.find({ symbol: symbol.toUpperCase(), status: 'approved' }).sort({ publishedAt: -1 })
    ]);

    const yahooNews = (searchResult.news || []).map((n, index) => ({
      id: n.uuid || index,
      title: n.title,
      source: n.publisher || 'Yahoo Finance',
      time: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString() : new Date().toISOString(),
      sentiment: 'neutral',
      verified: true,
      url: n.link,
      thumbnail: n.thumbnail?.resolutions?.[0]?.url || null,
    }));

    const formattedDbNews = dbNews.map(n => ({
      id: n._id,
      title: n.title,
      source: n.source,
      time: n.publishedAt ? n.publishedAt.toISOString() : n.createdAt.toISOString(),
      sentiment: 'neutral',
      verified: true,
      url: n.url || '#',
      isLocal: true,
      content: n.content
    }));

    res.json([...formattedDbNews, ...yahooNews]);
  } catch (error) {
    console.error(`Error fetching news for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to fetch stock news' });
  }
});

// POST /api/news/submit
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { title, content, symbol } = req.body;
    const news = await News.create({
      title,
      content,
      symbol: symbol ? symbol.toUpperCase() : null,
      submittedBy: req.user.id
    });
    res.status(201).json(news);
  } catch (error) {
    console.error('Error submitting news:', error);
    res.status(500).json({ error: 'Failed to submit news' });
  }
});

module.exports = router;
