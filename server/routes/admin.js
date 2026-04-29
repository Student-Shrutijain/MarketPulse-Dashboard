const express = require('express');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  res.json({
    totalUsers: 12450,
    activeToday: 3240,
    newsPublished: 1856,
    apiCalls: 45200,
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', role: 'user', joined: '2026-03-15' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', role: 'user', joined: '2026-03-20' },
  ]);
});

module.exports = router;
