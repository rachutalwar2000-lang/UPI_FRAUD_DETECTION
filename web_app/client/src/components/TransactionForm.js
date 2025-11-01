// web_app/client/src/components/TransactionForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, Alert, CircularProgress,
  Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, ButtonGroup, Tooltip, keyframes
} from '@mui/material';
import {
  Send, CheckCircle, Warning, Assessment, PlayArrow, 
  Shield, TrendingUp, Verified
} from '@mui/icons-material';
import axios from 'axios';
import { DEMO_TRANSACTIONS, loadDemoTransaction } from '../utils/demoTransactions';

// Animated background
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const ResultDialog = ({ open, onClose, result }) => {
  if (!result) return null;

  const isFraud = result.prediction === 'Fraud';
  const riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: isFraud ? 
          'linear-gradient(135deg, #f5576c 0%, #ff6b81 100%)' : 
          'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
        color: 'white',
        py: 3
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          {isFraud ? 
            <Warning sx={{ fontSize: 50 }} /> : 
            <CheckCircle sx={{ fontSize: 50 }} />
          }
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {isFraud ? '🚨 Fraudulent Transaction Detected!' : '✅ Transaction Verified'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              AI-powered analysis completed
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 3, pb: 3 }}>
        {/* Transaction ID Card */}
        <Card elevation={0} sx={{ bgcolor: '#f5f7fa', mb: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Transaction ID
              </Typography>
              <Typography variant="h6" fontFamily="monospace" fontWeight="bold">
                {result.transactionId}
              </Typography>
            </Box>
            <Verified sx={{ fontSize: 40, color: '#667eea' }} />
          </Box>
        </Card>

        {/* Risk Metrics */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Risk Score
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                color={riskLevel === 'high' ? 'error.main' : 
                       riskLevel === 'medium' ? 'warning.main' : 'success.main'}
              >
                {result.riskScore}%
              </Typography>
              <Chip 
                label={riskLevel.toUpperCase()}
                size="small"
                color={riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success'}
                sx={{ mt: 1 }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Prediction
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {isFraud ? '🚫' : '✓'}
              </Typography>
              <Chip 
                label={result.prediction}
                color={isFraud ? 'error' : 'success'}
                sx={{ mt: 1 }}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Confidence
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {(result.confidence * 100).toFixed(1)}%
              </Typography>
              <Chip 
                label="HIGH"
                size="small"
                color="info"
                sx={{ mt: 1 }}
              />
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Transaction Details */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          📋 Transaction Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Amount</Typography>
            <Typography variant="h6" fontWeight="bold">₹{result.details?.amount}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Type</Typography>
            <Typography variant="h6" fontWeight="bold">{result.details?.transactionType}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">From</Typography>
            <Typography variant="body1" fontWeight="bold">{result.details?.senderUpiId}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">To</Typography>
            <Typography variant="body1" fontWeight="bold">{result.details?.receiverUpiId}</Typography>
          </Grid>
          {result.details?.location && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Location</Typography>
              <Typography variant="body1">{result.details.location}</Typography>
            </Grid>
          )}
        </Grid>

        {isFraud && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              ⚠️ Recommended Action
            </Typography>
            <Typography variant="body2">
              • Block this transaction immediately<br/>
              • Flag the sender account for review<br/>
              • Notify the user about suspicious activity<br/>
              • Report to fraud prevention team
            </Typography>
          </Alert>
        )}

        {!isFraud && result.riskScore < 30 && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body1" fontWeight="bold">
              ✅ Transaction appears safe to proceed
            </Typography>
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Close
        </Button>
        <Button 
          variant="contained" 
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
          }}
        >
          View Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    transactionType: 'P2P',
    senderUpiId: '',
    receiverUpiId: '',
    deviceId: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const loadDemo = (type) => {
    const demo = loadDemoTransaction(type, Math.floor(Math.random() * DEMO_TRANSACTIONS[type].length));
    setFormData(demo);
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/detect', formData);
      setResult(response.data);
      
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift(response.data);
      localStorage.setItem('transactions', JSON.stringify(transactions.slice(0, 100)));
      
      setDialogOpen(true);
      
      setFormData({
        amount: '',
        transactionType: 'P2P',
        senderUpiId: '',
        receiverUpiId: '',
        deviceId: '',
        location: '',
      });
    } catch (error) {
      console.error("Error analyzing transaction:", error);
      setError(error.response?.data?.message || 'Failed to analyze transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
      backgroundSize: '400% 400%',
      animation: `${gradientAnimation} 15s ease infinite`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        animation: `${floatingAnimation} 6s ease-in-out infinite`,
        backdropFilter: 'blur(10px)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: 150,
        height: 150,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        animation: `${floatingAnimation} 8s ease-in-out infinite`,
        backdropFilter: 'blur(10px)'
      }} />

      <Paper 
        elevation={24} 
        sx={{ 
          p: 4, 
          maxWidth: 1000, 
          mx: 'auto',
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Shield sx={{ 
            fontSize: 50, 
            color: '#667eea',
            animation: `${pulseAnimation} 2s ease-in-out infinite`
          }} />
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold" sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              Analyze Transaction
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI-powered fraud detection • Real-time analysis • 97% accuracy
            </Typography>
          </Box>
          <TrendingUp sx={{ fontSize: 40, color: '#4caf50' }} />
        </Box>

        {/* Demo Buttons */}
        <Card sx={{ mb: 3, p: 2, bgcolor: '#f5f7fa' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            🎯 Quick Test with Demo Data
          </Typography>
          <ButtonGroup variant="outlined" fullWidth>
            <Tooltip title="Load a safe transaction example">
              <Button 
                onClick={() => loadDemo('valid')}
                startIcon={<CheckCircle />}
                sx={{ color: '#4caf50', borderColor: '#4caf50' }}
              >
                Valid Demo
              </Button>
            </Tooltip>
            <Tooltip title="Load a medium-risk transaction">
              <Button 
                onClick={() => loadDemo('flagged')}
                startIcon={<Warning />}
                sx={{ color: '#ffa726', borderColor: '#ffa726' }}
              >
                Flagged Demo
              </Button>
            </Tooltip>
            <Tooltip title="Load a fraudulent transaction example">
              <Button 
                onClick={() => loadDemo('fraud')}
                startIcon={<Warning />}
                sx={{ color: '#f5576c', borderColor: '#f5576c' }}
              >
                Fraud Demo
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Card>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Form */}
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
                disabled={loading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontWeight: 'bold' }}>₹</Typography>
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="transactionType"
                  value={formData.transactionType}
                  label="Transaction Type"
                  onChange={handleChange}
                >
                  <MenuItem value="P2P">💳 P2P (Person to Person)</MenuItem>
                  <MenuItem value="P2M">🏪 P2M (Person to Merchant)</MenuItem>
                  <MenuItem value="Business">🏢 Business Transaction</MenuItem>
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
                disabled={loading}
                placeholder="user@paytm"
                helperText="Example: john.doe@paytm"
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
                disabled={loading}
                placeholder="merchant@googlepay"
                helperText="Example: store@googlepay"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Device ID (Optional)"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleChange}
                disabled={loading}
                placeholder="DEVICE-12345"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (Optional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                placeholder="Mumbai, Maharashtra"
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            sx={{
              mt: 4,
              py: 2,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 40px rgba(102, 126, 234, 0.5)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Analyzing Transaction...' : 'Analyze Transaction with AI'}
          </Button>
        </Box>
      </Paper>

      <ResultDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        result={result} 
      />
    </Box>
  );
};

export default TransactionForm;