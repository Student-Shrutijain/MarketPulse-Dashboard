const express = require('express');
const router = express.Router();

// GET /api/portfolio (demo)
router.get('/', (req, res) => {
  res.json({ message: 'Portfolio endpoint — use frontend state for demo' });
});

module.exports = router;
