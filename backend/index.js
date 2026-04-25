const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
// app.use(cors());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://abhinavrishi45.github.io"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// // Routes (to be imported later)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/vehicles', require('./routes/vehicles'));
// app.use('/api/bookings', require('./routes/bookings'));
// app.use('/api/counters', require('./routes/counters'));

console.log("Starting server...");

try {
  app.use('/api/auth', require('./routes/auth'));
  console.log("Auth route loaded");

  app.use('/api/vehicles', require('./routes/vehicles'));
  console.log("Vehicles route loaded");

  app.use('/api/bookings', require('./routes/bookings'));
  console.log("Bookings route loaded");

  app.use('/api/counters', require('./routes/counters'));
  console.log("Counters route loaded");

} catch (err) {
  console.error("Route loading error:", err);
  process.exit(1);
}

// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//   });


const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error ❌:", err);
    process.exit(1);
  });

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI missing ❌");
  process.exit(1);
}