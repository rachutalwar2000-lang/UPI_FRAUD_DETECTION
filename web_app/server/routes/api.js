// web_app/server/routes/api.js

const express = require('express');
const axios = require('axios');
const router = express.Router();

const ML_API_URL = 'http://127.0.0.1:5000/predict'; // URL of your Python API

router.post('/detect', async (req, res) => {
  try {
    // Get the transaction details from the React app's request
    const transactionData = req.body;
    console.log('Forwarding data to ML API:', transactionData);

    // Forward the data to the Python Flask API
    const response = await axios.post(ML_API_URL, transactionData);

    // Send the prediction from the ML API back to the React app
    res.json(response.data);
    
  } catch (error) {
    console.error('Error connecting to the ML API:', error.message);
    res.status(500).json({ error: 'Failed to get a prediction' });
  }
});

module.exports = router;