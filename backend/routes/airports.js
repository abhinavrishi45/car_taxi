const express = require('express');
const router = express.Router();
const Airport = require('../models/Airport');
const auth = require('../middleware/auth');

// Get all airports (admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const airports = await Airport.find().sort({ createdAt: 1 });
    res.json(airports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create airport (admin)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { transportName, stationName, location } = req.body;
    if (!transportName || !stationName || !location) return res.status(400).json({ message: 'All fields are required' });
    const airport = new Airport({ transportName, stationName, location });
    await airport.save();
    res.status(201).json(airport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete airport (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const airport = await Airport.findByIdAndDelete(req.params.id);
    if (!airport) return res.status(404).json({ message: 'Airport not found' });
    res.json({ message: 'Airport deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
