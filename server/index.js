const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Global state for real-time stats
global.apiCallCount = 0;

// Middleware
app.use(cors());
app.use(express.json());

// API Call Tracker Middleware
app.use('/api', (req, res, next) => {
  global.apiCallCount++;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/market', require('./routes/market'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/news', require('./routes/news'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const { default: YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// WebSocket for live updates
const activeSubscriptions = new Map(); // socket.id -> Set of symbols

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  activeSubscriptions.set(socket.id, new Set());

  socket.on('subscribe', (symbols) => {
    console.log(`Client ${socket.id} subscribed to:`, symbols);
    const set = activeSubscriptions.get(socket.id);
    if (set) {
      symbols.forEach(s => set.add(s));
    }
  });

  socket.on('unsubscribe', (symbols) => {
    const set = activeSubscriptions.get(socket.id);
    if (set) {
      symbols.forEach(s => set.delete(s));
    }
  });

  socket.on('join-admin', () => {
    console.log(`Admin ${socket.id} joined admin-room`);
    socket.join('admin-room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeSubscriptions.delete(socket.id);
  });
});

// Broadcast real-time stats to Admin Dashboard
const User = require('./models/User');
const News = require('./models/News');

setInterval(async () => {
  if (io.sockets.adapter.rooms.has('admin-room')) {
    try {
      const [totalUsers, newsPublished, pendingNews] = await Promise.all([
        User.countDocuments(),
        News.countDocuments({ status: 'approved' }),
        News.countDocuments({ status: 'pending' })
      ]);

      io.to('admin-room').emit('stats-update', {
        totalUsers,
        newsPublished,
        pendingNews,
        apiCalls: global.apiCallCount
      });
    } catch (err) {
      console.error('Error broadcasting admin stats:', err.message);
    }
  }
}, 3000);

// Auto-sync news every 24 hours
setInterval(async () => {
  try {
    const searchResult = await yahooFinance.search('India stock market NSE', { newsCount: 15 });
    const newsItems = searchResult.news || [];
    const News = require('./models/News');
    
    for (const item of newsItems) {
      const exists = await News.findOne({ title: item.title });
      if (!exists) {
        await News.create({
          title: item.title,
          content: `Automated daily sync from ${item.publisher}.`,
          source: item.publisher || 'Yahoo Finance',
          status: 'pending',
          submittedBy: null,
          url: item.link
        });
      }
    }
    console.log('Daily news sync completed');
  } catch (err) {
    console.error('Daily news sync failed:', err.message);
  }
}, 24 * 60 * 60 * 1000);

// Periodic fetch and emit live prices
setInterval(async () => {
  const allSymbolsToFetch = new Set();
  for (const symbols of activeSubscriptions.values()) {
    symbols.forEach(s => allSymbolsToFetch.add(s));
  }
  
  const symbolsArray = Array.from(allSymbolsToFetch);
  if (symbolsArray.length > 0) {
    try {
      const quotes = await yahooFinance.quote(symbolsArray);
      const quotesMap = {};
      quotes.forEach(q => {
        quotesMap[q.symbol] = {
          symbol: q.symbol,
          price: +(q.regularMarketPrice || 0).toFixed(2),
          change: +(q.regularMarketChange || 0).toFixed(2),
          changePercent: +(q.regularMarketChangePercent || 0).toFixed(2),
        };
      });

      for (const [socketId, symbols] of activeSubscriptions.entries()) {
        const clientUpdates = {};
        let hasUpdates = false;
        symbols.forEach(s => {
          if (quotesMap[s]) {
            clientUpdates[s] = quotesMap[s];
            hasUpdates = true;
          }
        });
        
        if (hasUpdates) {
          io.to(socketId).emit('price-update', clientUpdates);
        }
      }
    } catch (err) {
      console.error('Error fetching live quotes:', err.message);
    }
  }
}, 5000); // 5 second polling

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\n✅ Connected to MongoDB Atlas');
    server.listen(PORT, () => {
      console.log(`🚀 MarketPulse API running on port ${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

module.exports = { app, io };
