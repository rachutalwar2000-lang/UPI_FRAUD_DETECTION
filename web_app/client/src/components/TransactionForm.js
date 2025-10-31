// src/components/TransactionForm.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import axios from 'axios';

// We'll define the ResultModal in the same file for simplicity for now
const ResultModal = ({ open, handleClose, result }) => (
  // Your ResultModal code from before can be placed here if you prefer separate files
  // For now, we'll just show an alert.
  <div/>
);


const TransactionForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    transactionType: 'P2P',
    senderUpiId: '',
    receiverUpiId: '',
    deviceId: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    try {
      // This is where you'll eventually send the data to your backend
      // const response = await axios.post('http://localhost:5001/api/detect', formData);
      // For now, we'll simulate a result
      const simulatedResult = Math.random() > 0.5 ? 'Fraud' : 'Valid';
      alert(`Transaction Analysis Result: ${simulatedResult}`);
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      alert("Failed to analyze transaction.");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Submit Transaction for Analysis
      </Typography>
      <Box component="form" onSubmit={handleAnalyze}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Amount (₹)"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                name="transactionType"
                value={formData.transactionType}
                label="Transaction Type"
                onChange={handleChange}
              >
                <MenuItem value="P2P">P2P (Person to Person)</MenuItem>
                <MenuItem value="P2M">P2M (Person to Merchant)</MenuItem>
                <MenuItem value="Business">Business Transaction</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Sender UPI ID"
              name="senderUpiId"
              value={formData.senderUpiId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Receiver UPI ID"
              name="receiverUpiId"
              value={formData.receiverUpiId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Device ID (Optional)"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location (Optional)"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, py: 1.5 }}
        >
          Analyze Transaction
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionForm;