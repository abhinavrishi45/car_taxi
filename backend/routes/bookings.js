const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// Create a new booking (Agent)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
    const bookingData = { ...req.body, agentId: req.user.id, fromAirport: req.user.airportName };
    const newBooking = new Booking(bookingData);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent bookings
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
    const bookings = await Booking.find({ agentId: req.user.id }).populate('vehicleId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (Admin)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const bookings = await Booking.find().populate('vehicleId').populate('agentId', 'airportName username location');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
