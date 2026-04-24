const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

// Get all counters/agents (Admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    // Fetch agents without their passwords
    const counters = await Agent.find().select('-password');
    res.json(counters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
