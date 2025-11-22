// web_app/client/src/components/TransactionForm.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, Alert, CircularProgress,
  Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, ButtonGroup, Tooltip, keyframes,
  Avatar, LinearProgress, IconButton, InputAdornment, Stepper,
  Step, StepLabel
} from '@mui/material';
import {
  Send, CheckCircle, Warning, Assessment, PlayArrow, Shield,
  TrendingUp, Verified, Person, Store, Business, LocationOn,
  Smartphone, CurrencyRupee, Close, Download, Share, GppBad,
  GppGood, GppMaybe, Security, Analytics
} from '@mui/icons-material';
import axios from 'axios';
import { DEMO_TRANSACTIONS, loadDemoTransaction } from '../utils/demoTransactions';

// Animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

// Result Dialog Component
const ResultDialog = ({ open, onClose, result }) => {
  if (!result) return null;

  const isFraud = result.prediction === 'Fraud';
  const riskLevel = result.riskScore >= 70 ? 'high' : result.riskScore >= 40 ? 'medium' : 'low';

  const getConfig = () => {
    if (isFraud) return {
      gradient: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)',
      icon: <GppBad sx={{ fontSize: 60 }} />,
      title: 'Fraudulent Transaction Detected',
      subtitle: 'This transaction has been blocked',
    };
    if (riskLevel === 'medium') return {
      gradient: 'linear-gradient(135deg, #ef6c00 0%, #ffa726 100%)',
      icon: <GppMaybe sx={{ fontSize: 60 }} />,
      title: 'Transaction Flagged for Review',
      subtitle: 'Manual verification recommended',
    };
    return {
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
      icon: <GppGood sx={{ fontSize: 60 }} />,
      title: 'Transaction Verified',
      subtitle: 'Safe to proceed',
    };
  };
  const config = getConfig();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      {/* Header */}
      <Box sx={{ background: config.gradient, color: 'white', p: 4, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}>
          <Close />
        </IconButton>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
            {config.icon}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{config.title}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>{config.subtitle}</Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {/* Transaction ID */}
        <Card sx={{ bgcolor: '#f5f7fa', mb: 3 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
              <Typography variant="h6" fontFamily="monospace" fontWeight="bold">
                {result.transactionId}
              </Typography>
            </Box>
            <Chip icon={<Verified />} label="Processed" color="primary" />
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="caption" color="text.secondary">Risk Score</Typography>
              <Typography variant="h3" fontWeight="bold" color={
                riskLevel === 'high' ? 'error.main' : riskLevel === 'medium' ? 'warning.main' : 'success.main'
              }>
                {result.riskScore}%
              </Typography>
              <Chip label={riskLevel.toUpperCase()} size="small" color={
                riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success'
              } sx={{ mt: 1 }} />
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="caption" color="text.secondary">Prediction</Typography>
              <Typography variant="h3" fontWeight="bold">
                {isFraud ? '🚫' : riskLevel === 'medium' ? '⚠️' : '✅'}
              </Typography>
              <Chip label={result.prediction} size="small" color={isFraud ? 'error' : 'success'} sx={{ mt: 1 }} />
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="caption" color="text.secondary">Confidence</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {(result.confidence * 100).toFixed(0)}%
              </Typography>
              <Chip label="HIGH" size="small" color="info" sx={{ mt: 1 }} />
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Transaction Details */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Transaction Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Amount</Typography>
              <Typography variant="h5" fontWeight="bold">₹{result.details?.amount}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Type</Typography>
              <Typography variant="h6" fontWeight="bold">{result.details?.transactionType}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">From</Typography>
              <Typography variant="body1" fontWeight="600">{result.details?.senderUpiId}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">To</Typography>
              <Typography variant="body1" fontWeight="600">{result.details?.receiverUpiId}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Recommendations */}
        {isFraud && (
          <Alert severity="error" sx={{ mt: 3 }} icon={<Security />}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>Recommended Actions:</Typography>
            <Typography variant="body2">
              • Block transaction immediately • Flag sender account • Notify user • Report to fraud team
            </Typography>
          </Alert>
        )}
        {riskLevel === 'medium' && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>Review Required:</Typography>
            <Typography variant="body2">
              • Verify sender identity • Check transaction history • Confirm with user
            </Typography>
          </Alert>
        )}
        {!isFraud && riskLevel === 'low' && (
          <Alert severity="success" sx={{ mt: 3 }} icon={<CheckCircle />}>
            <Typography variant="body2" fontWeight="bold">Transaction verified and safe to proceed</Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, bgcolor: '#f5f7fa' }}>
        <Button startIcon={<Download />} variant="outlined">Export Report</Button>
        <Button startIcon={<Share />} variant="outlined">Share</Button>
        <Button onClick={onClose} variant="contained"
          sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    amount: '', transactionType: 'P2P', senderUpiId: '',
    receiverUpiId: '', deviceId: '', location: '',
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
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/detect', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift(response.data);
      localStorage.setItem('transactions', JSON.stringify(transactions.slice(0, 100)));
      setDialogOpen(true);
      setFormData({ amount: '', transactionType: 'P2P', senderUpiId: '', receiverUpiId: '', deviceId: '', location: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to analyze transaction.');
    } finally {
      setLoading(false);
    }
  };

  const txTypes = [
    { value: 'P2P', label: 'Person to Person', icon: <Person /> },
    { value: 'P2M', label: 'Person to Merchant', icon: <Store /> },
    { value: 'Business', label: 'Business Transaction', icon: <Business /> },
  ];

  return (
    <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f7fa' }}>
      <Grid container spacing={4}>
        {/* Left - Form */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#1a237e' }}>
                <Analytics sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" color="#1a237e">
                  Analyze Transaction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-powered fraud detection • Real-time analysis
                </Typography>
              </Box>
            </Box>

            {/* Demo Buttons */}
            <Card sx={{ mb: 3, p: 2, bgcolor: '#e8eaf6', border: '1px dashed #3949ab' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1a237e" gutterBottom>
                Quick Test with Demo Data
              </Typography>
              <ButtonGroup fullWidth variant="outlined">
                <Button onClick={() => loadDemo('valid')} startIcon={<GppGood />}
                  sx={{ color: '#2e7d32', borderColor: '#2e7d32' }}>Valid</Button>
                <Button onClick={() => loadDemo('flagged')} startIcon={<GppMaybe />}
                  sx={{ color: '#ef6c00', borderColor: '#ef6c00' }}>Flagged</Button>
                <Button onClick={() => loadDemo('fraud')} startIcon={<GppBad />}
                  sx={{ color: '#c62828', borderColor: '#c62828' }}>Fraud</Button>
              </ButtonGroup>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleAnalyze}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth required label="Amount" name="amount" type="number"
                    value={formData.amount} onChange={handleChange} disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CurrencyRupee /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select name="transactionType" value={formData.transactionType}
                      label="Transaction Type" onChange={handleChange} disabled={loading}>
                      {txTypes.map(t => (
                        <MenuItem key={t.value} value={t.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {t.icon} {t.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth required label="Sender UPI ID" name="senderUpiId"
                    value={formData.senderUpiId} onChange={handleChange} disabled={loading}
                    placeholder="user@paytm"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth required label="Receiver UPI ID" name="receiverUpiId"
                    value={formData.receiverUpiId} onChange={handleChange} disabled={loading}
                    placeholder="merchant@googlepay"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Store /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Device ID" name="deviceId"
                    value={formData.deviceId} onChange={handleChange} disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Smartphone /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Location" name="location"
                    value={formData.location} onChange={handleChange} disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                sx={{
                  mt: 4, py: 2, fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)',
                  boxShadow: '0 8px 25px rgba(26,35,126,0.3)',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 35px rgba(26,35,126,0.4)' },
                }}>
                {loading ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right - Info Panel */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#1a237e">
              How It Works
            </Typography>
            <Stepper orientation="vertical" sx={{ mt: 2 }}>
              {['Enter transaction details', 'AI analyzes patterns', 'Get instant results'].map((label, i) => (
                <Step key={i} active>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1a237e, #3949ab)', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Model Stats</Typography>
            <Grid container spacing={2} mt={1}>
              {[{ label: 'Accuracy', value: '97%' }, { label: 'Speed', value: '<100ms' },
                { label: 'Analyzed', value: '10K+' }].map((stat, i) => (
                <Grid item xs={4} key={i}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <ResultDialog open={dialogOpen} onClose={() => setDialogOpen(false)} result={result} />
    </Box>
  );
};

export default TransactionForm;