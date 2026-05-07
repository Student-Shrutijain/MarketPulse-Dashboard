const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    trim: true,
    uppercase: true
  },
  source: {
    type: String,
    default: 'User Contribution'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
  url: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('News', newsSchema);
