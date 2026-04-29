const express = require('express');
const router = express.Router();

const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

// GET /api/news
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'finance';
    
    if (category && category !== 'all') {
      query = `finance ${category}`;
    }
    
    const searchResult = await yahooFinance.search(query, { newsCount: 15 });
    const news = searchResult.news.map((n, index) => ({
      id: n.uuid || index,
      title: n.title,
      source: n.publisher || 'Yahoo Finance',
      time: n.providerPublishTime ? new Date(n.providerPublishTime).toISOString() : new Date().toISOString(),
      sentiment: 'neutral', // Yahoo search does not provide explicit sentiment
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

module.exports = router;
