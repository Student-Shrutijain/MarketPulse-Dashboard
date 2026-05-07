const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
});

const watchlistSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  change: { type: Number, required: true },
  changePercent: { type: Number, required: true },
});

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  watchlist: [watchlistSchema],
  holdings: [holdingSchema],
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
