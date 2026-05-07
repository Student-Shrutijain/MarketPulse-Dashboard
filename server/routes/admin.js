const express = require('express');
const router = express.Router();
const User = require('../models/User');
const News = require('../models/News');
const Portfolio = require('../models/Portfolio');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, newsPublished, pendingNews] = await Promise.all([
      User.countDocuments(),
      News.countDocuments({ status: 'approved' }),
      News.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalUsers,
      activeToday: Math.max(1, Math.floor(totalUsers * 0.4)),
      newsPublished: newsPublished,
      apiCalls: global.apiCallCount || 0,
      pendingNews
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const formatted = await Promise.all(users.map(async u => {
      const portfolio = await Portfolio.findOne({ user: u._id });
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        joined: new Date(u.createdAt).toISOString().split('T')[0],
        lastActive: 'Recently',
        watchlist: portfolio?.watchlist || [],
        holdings: portfolio?.holdings || []
      };
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/news/pending
router.get('/news/pending', async (req, res) => {
  try {
    const news = await News.find({ status: 'pending' })
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error('Error fetching pending news:', error);
    res.status(500).json({ error: 'Failed to fetch pending news' });
  }
});

// POST /api/admin/news/moderate
router.post('/news/moderate', async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const news = await News.findByIdAndUpdate(id, { 
      status, 
      publishedAt: status === 'approved' ? new Date() : null 
    }, { new: true });

    res.json(news);
  } catch (error) {
    console.error('Error moderating news:', error);
    res.status(500).json({ error: 'Failed to moderate news' });
  }
});

const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// POST /api/admin/news/sync
router.post('/news/sync', async (req, res) => {
  console.log('Admin news sync triggered by:', req.user?.id);
  try {
    const keywords = ['Reliance Industries news', 'HDFC Bank market', 'TCS stocks', 'Adani Group news', 'Sensex Nifty today'];
    let count = 0;
    
    for (const kw of keywords) {
      const searchResult = await yahooFinance.search(kw, { newsCount: 8 });
      const newsItems = searchResult.news || [];
      console.log(`Syncing keyword "${kw}": found ${newsItems.length} items`);
      
      for (const item of newsItems) {
        const exists = await News.findOne({ title: item.title });
        if (!exists) {
          console.log('Creating new news:', item.title);
          await News.create({
            title: item.title,
            content: `Automated news from ${item.publisher}. Summary: ${item.title}`,
            source: item.publisher || 'Yahoo Finance',
            status: 'pending',
            submittedBy: null,
            url: item.link
          });
          count++;
        } else {
          // console.log('Duplicate news skipped:', item.title);
        }
      }
    }

    res.json({ message: `Successfully synced ${count} new news items.`, count });
  } catch (error) {
    console.error('Error syncing news:', error);
    res.status(500).json({ error: 'Failed to sync news' });
  }
});

module.exports = router;
