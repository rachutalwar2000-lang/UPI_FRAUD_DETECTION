// web_app/server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
app.use('/api/detect', apiRoutes); // Your existing fraud detection route
app.use('/api/auth', authRoutes);  // The new authentication routes

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});