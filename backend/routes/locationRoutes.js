const express = require('express');
const router = express.Router();
const Location = require('../models/locationModel');
const auth = require('../middleware/auth');

// Public: list published locations
router.get('/public', async (req, res) => {
  try {
    const list = await Location.findAll({ where: { isPublished: true }, order: [['createdAt', 'DESC']] });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// Admin: get all locations
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const list = await Location.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// Admin: get single location
router.get('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const rec = await Location.findByPk(id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    return res.json(rec);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// Admin: create location
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const payload = req.body || {};
    if (!payload.name || payload.lat == null || payload.lng == null) return res.status(400).json({ message: 'name, lat and lng are required' });
    const rec = await Location.create(payload);
    return res.status(201).json(rec);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// Admin: update location
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const rec = await Location.findByPk(id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    await rec.update(req.body || {});
    return res.json(rec);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// Admin: publish/unpublish
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { publish } = req.body;
    const rec = await Location.findByPk(id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    rec.isPublished = !!publish;
    await rec.save();
    return res.json(rec);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// Admin: delete location
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const rec = await Location.findByPk(id);
    if (!rec) return res.status(404).json({ message: 'Not found' });
    await rec.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

module.exports = router;
