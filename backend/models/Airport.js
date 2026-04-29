const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  transportName: { type: String, required: true },
  stationName: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Airport', airportSchema);
