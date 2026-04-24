const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Agent Signup
router.post('/agent/signup', async (req, res) => {
  try {
    const { airportName, username, email, password, location } = req.body;
    const existingAgent = await Agent.findOne({ $or: [{ email }, { username }] });
    if (existingAgent) return res.status(400).json({ message: 'Agent already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAgent = new Agent({ airportName, username, email, password: hashedPassword, location });
    await newAgent.save();

    res.status(201).json({ message: 'Agent created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agent Login
router.post('/agent/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const agent = await Agent.findOne({ username });
    if (!agent) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: agent._id, role: 'agent', airportName: agent.airportName }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, agent: { id: agent._id, username: agent.username, airportName: agent.airportName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Signup
router.post('/admin/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    const token = jwt.sign({ id: newAdmin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, admin: { id: newAdmin._id, username: newAdmin.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Fallback simple auth for development if no admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0 && username === 'admin' && password === 'admin') {
      const token = jwt.sign({ id: 'admin_id', role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ token, admin: { username: 'admin' } });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { id: admin._id, username: admin.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
