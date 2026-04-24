const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  passengerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  numberOfPersons: { type: Number, required: true },
  numberOfMales: { type: Number, required: true },
  numberOfFemales: { type: Number, required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  date: { type: Date, required: true },
  fromAirport: { type: String, required: true },
  toDestination: { type: String, required: true },
  manualFarePrice: { type: Number, required: true },
  paymentMode: { type: String, enum: ['online_upi', 'online_card', 'cash'], required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
