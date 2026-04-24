const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  airportName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Agent', agentSchema);
