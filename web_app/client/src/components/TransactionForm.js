// web_app/client/src/components/TransactionForm.js - REDESIGNED MODERN UI
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Grid, Select, MenuItem,
  FormControl, InputLabel, Paper, Alert, CircularProgress,
  Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, ButtonGroup, Tooltip, keyframes,
  Avatar, LinearProgress, IconButton, InputAdornment, Stack
} from '@mui/material';
import {
  Send, CheckCircle, Warning, Assessment, PlayArrow, Shield,
  TrendingUp, Verified, Person, Store, Business, LocationOn,
  Smartphone, CurrencyRupee, Close, Download, Share, GppBad,
  GppGood, GppMaybe, Security, Analytics, Speed, AutoAwesome
} from '@mui/icons-material';
import axios from 'axios';
import { DEMO_TRANSACTIONS, loadDemoTransaction } from '../utils/demoTransactions';

// Animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box sx={{ background: config.gradient, color: 'white', p: 4, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}><Close /></IconButton>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>{config.icon}</Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{config.title}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>{config.subtitle}</Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        <Card sx={{ bgcolor: '#f5f7fa', mb: 3 }}>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
            <Typography variant="h6" fontFamily="monospace" fontWeight="bold">{result.transactionId}</Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="caption" color="text.secondary">Risk Score</Typography>
              <Typography variant="h3" fontWeight="bold" color={riskLevel === 'high' ? 'error.main' : riskLevel === 'medium' ? 'warning.main' : 'success.main'}>
                {result.riskScore}%
              </Typography>
              <Chip label={riskLevel.toUpperCase()} size="small" color={riskLevel === 'high' ? 'error' : riskLevel === 'medium' ? 'warning' : 'success'} sx={{ mt: 1 }} />
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="caption" color="text.secondary">Prediction</Typography>
              <Typography variant="h3" fontWeight="bold">{isFraud ? '🚫' : riskLevel === 'medium' ? '⚠️' : '✅'}</Typography>
              <Chip label={result.prediction} size="small" color={isFraud ? 'error' : 'success'} sx={{ mt: 1 }} />
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="caption" color="text.secondary">Confidence</Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">{(result.confidence * 100).toFixed(0)}%</Typography>
              <Chip label="HIGH" size="small" color="info" sx={{ mt: 1 }} />
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Transaction Details</Typography>
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

        {isFraud && (
          <Alert severity="error" sx={{ mt: 3 }} icon={<Security />}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>Recommended Actions:</Typography>
            <Typography variant="body2">• Block transaction immediately • Flag sender account • Notify user • Report to fraud team</Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, bgcolor: '#f5f7fa' }}>
        
        <Button onClick={onClose} variant="contained" sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}>Close</Button>
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
    { value: 'P2P', label: 'Person to Person', icon: <Person />, color: '#1a237e' },
    { value: 'P2M', label: 'Person to Merchant', icon: <Store />, color: '#00695c' },
    { value: 'Business', label: 'Business Transaction', icon: <Business />, color: '#ef6c00' },
  ];

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: 'calc(100vh - 64px)', 
      bgcolor: '#f5f7fa',
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header with Gradient */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', 
        borderRadius: 4, 
        p: 4, 
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Analytics sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">AI-Powered Fraud Detection</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>Real-time transaction analysis with 97%+ accuracy</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        
        {/* Left - Form Section (Wider) */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '2 1 0' }, minWidth: 0 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            {/* Quick Test Buttons */}
            <Card sx={{ mb: 3, p: 2, bgcolor: '#f8f9ff', border: '2px dashed #3949ab' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="#1a237e" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome /> Quick Test with Demo Data
              </Typography>
              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                <Button 
                  onClick={() => loadDemo('valid')} 
                  startIcon={<GppGood />}
                  variant="outlined"
                  sx={{ color: '#2e7d32', borderColor: '#2e7d32', '&:hover': { bgcolor: '#e8f5e9', borderColor: '#2e7d32' } }}
                >
                  Valid Transaction
                </Button>
                <Button 
                  onClick={() => loadDemo('flagged')} 
                  startIcon={<GppMaybe />}
                  variant="outlined"
                  sx={{ color: '#ef6c00', borderColor: '#ef6c00', '&:hover': { bgcolor: '#fff3e0', borderColor: '#ef6c00' } }}
                >
                  Flagged Transaction
                </Button>
                <Button 
                  onClick={() => loadDemo('fraud')} 
                  startIcon={<GppBad />}
                  variant="outlined"
                  sx={{ color: '#c62828', borderColor: '#c62828', '&:hover': { bgcolor: '#ffebee', borderColor: '#c62828' } }}
                >
                  Fraud Transaction
                </Button>
              </Stack>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleAnalyze}>
              <Grid container spacing={3}>
                {/* Amount & Type Row */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    required 
                    label="Amount" 
                    name="amount" 
                    type="number"
                    value={formData.amount} 
                    onChange={handleChange} 
                    disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><CurrencyRupee sx={{ fontSize: 20 }} /></InputAdornment>,
                    }}
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
                      disabled={loading}
                    >
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

                {/* UPI IDs Row */}
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
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 20 }} /></InputAdornment>,
                    }}
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
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Store sx={{ fontSize: 20 }} /></InputAdornment>,
                    }}
                  />
                </Grid>

                {/* Optional Fields Row */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Device ID (Optional)" 
                    name="deviceId"
                    value={formData.deviceId} 
                    onChange={handleChange} 
                    disabled={loading}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Smartphone sx={{ fontSize: 20 }} /></InputAdornment>,
                    }}
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
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 20 }} /></InputAdornment>,
                    }}
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
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)',
                  boxShadow: '0 8px 25px rgba(26,35,126,0.3)',
                  '&:hover': { 
                    transform: 'translateY(-2px)', 
                    boxShadow: '0 12px 35px rgba(26,35,126,0.4)' 
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Analyzing with AI...' : 'Analyze Transaction'}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right - Info Panel (Narrower) */}
        <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 0' }, minWidth: { xs: 'auto', lg: 320 }, maxWidth: { xs: '100%', lg: 450 } }}>
          {/* How It Works */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#1a237e" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield /> How It Works
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { step: '1', text: 'Enter transaction details', icon: <Assessment /> },
                { step: '2', text: 'AI analyzes patterns using XGBoost', icon: <Speed /> },
                { step: '3', text: 'Get instant fraud prediction', icon: <CheckCircle /> }
              ].map((item, i) => (
                <Box key={i} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  mb: 1.5,
                  bgcolor: i === 0 ? '#e8eaf6' : i === 1 ? '#fff3e0' : '#e8f5e9',
                  borderRadius: 2,
                  animation: `${fadeInUp} 0.5s ease-out ${i * 0.1}s both`
                }}>
                  <Avatar sx={{ 
                    bgcolor: i === 0 ? '#1a237e' : i === 1 ? '#ef6c00' : '#2e7d32', 
                    width: 40, 
                    height: 40,
                    fontWeight: 'bold'
                  }}>
                    {item.step}
                  </Avatar>
                  <Typography variant="body2" fontWeight="500">{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Model Stats */}
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #1a237e, #3949ab)', 
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
              Model Performance
            </Typography>
            <Grid container spacing={2} mt={1} sx={{ position: 'relative', zIndex: 1 }}>
              {[
                { label: 'Accuracy', value: '97%', icon: <Analytics /> },
                { label: 'Speed', value: '<100ms', icon: <Speed /> },
                { label: 'Analyzed', value: '10K+', icon: <Assessment /> }
              ].map((stat, i) => (
                <Grid item xs={4} key={i}>
                  <Box textAlign="center">
                    <Box sx={{ fontSize: 24, mb: 0.5 }}>{stat.icon}</Box>
                    <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Features List */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#1a237e">
              Key Features
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { icon: <Speed />, text: 'Real-time Analysis', color: '#1a237e' },
                { icon: <Shield />, text: 'Bank-grade Security', color: '#00695c' },
                { icon: <TrendingUp />, text: '97%+ Accuracy', color: '#ef6c00' },
                { icon: <Analytics />, text: 'AI-powered Detection', color: '#1565c0' }
              ].map((feature, i) => (
                <Box key={i} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  py: 1.5,
                  borderBottom: i < 3 ? '1px solid #f0f0f0' : 'none'
                }}>
                  <Avatar sx={{ bgcolor: `${feature.color}15`, color: feature.color, width: 36, height: 36 }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="body2" fontWeight="500">{feature.text}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      <ResultDialog open={dialogOpen} onClose={() => setDialogOpen(false)} result={result} />
    </Box>
  );
};

export default TransactionForm;