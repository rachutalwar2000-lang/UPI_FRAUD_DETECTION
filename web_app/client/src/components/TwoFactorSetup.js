// web_app/client/src/components/TwoFactorSetup.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step,
  StepLabel, Grid, Chip, Divider, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Tooltip
} from '@mui/material';
import {
  Security, QrCode2, CheckCircle, ContentCopy, Smartphone,
  Key, Warning, Visibility, VisibilityOff, Shield, Lock
} from '@mui/icons-material';
import axios from 'axios';

const TwoFactorSetup = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const steps = ['Setup', 'Verify', 'Backup Codes'];

  useEffect(() => {
    if (open && step === 0) {
      generateQRCode();
    }
  }, [open]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/auth/2fa/setup',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate QR code' });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/auth/2fa/verify',
        { code: verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBackupCodes(response.data.backupCodes);
      setStep(2);
      setMessage({ type: 'success', text: '2FA enabled successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid verification code' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setMessage({ type: 'success', text: 'All codes copied to clipboard!' });
  };

  const handleComplete = () => {
    onSuccess?.();
    onClose();
    setStep(0);
    setVerificationCode('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        color: 'white', display: 'flex', alignItems: 'center', gap: 2
      }}>
        <Security sx={{ fontSize: 30 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">Two-Factor Authentication</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Secure your account</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        {/* Step 0: QR Code Setup */}
        {step === 0 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Scan this QR code with your authenticator app:
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Google Authenticator, Authy, or Microsoft Authenticator
            </Typography>

            <Box sx={{
              display: 'flex', justifyContent: 'center', mb: 3,
              p: 3, bgcolor: '#f5f7fa', borderRadius: 2
            }}>
              {loading ? (
                <CircularProgress />
              ) : qrCode ? (
                <img src={qrCode} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
              ) : (
                <QrCode2 sx={{ fontSize: 200, color: '#ccc' }} />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
              Can't scan? Enter this code manually:
            </Typography>

            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 1, p: 2, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3
            }}>
              <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
                {showSecret ? secret : '••••••••••••••••'}
              </Typography>
              <IconButton size="small" onClick={() => setShowSecret(!showSecret)}>
                {showSecret ? <VisibilityOff /> : <Visibility />}
              </IconButton>
              <IconButton size="small" onClick={() => copyToClipboard(secret, -1)}>
                <ContentCopy />
              </IconButton>
            </Box>

            <Button
              fullWidth variant="contained" onClick={() => setStep(1)}
              sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
            >
              I've Scanned the QR Code
            </Button>
          </Box>
        )}

        {/* Step 1: Verification */}
        {step === 1 && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter the 6-digit code from your authenticator app:
            </Typography>

            <TextField
              fullWidth value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" disabled={loading}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', letterSpacing: 15, fontSize: 32, fontWeight: 'bold' }
              }}
              sx={{ my: 3 }}
            />

            <Button
              fullWidth variant="contained" onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
            >
              {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </Button>

            <Button fullWidth sx={{ mt: 2 }} onClick={() => setStep(0)}>
              Back to QR Code
            </Button>
          </Box>
        )}

        {/* Step 2: Backup Codes */}
        {step === 2 && (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold">Save these backup codes!</Typography>
              <Typography variant="body2">
                Each code can only be used once. Store them securely.
              </Typography>
            </Alert>

            <Paper sx={{ p: 2, bgcolor: '#f5f7fa', mb: 3 }}>
              <Grid container spacing={1}>
                {backupCodes.map((code, index) => (
                  <Grid item xs={6} key={index}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0'
                    }}>
                      <Typography fontFamily="monospace" fontWeight="bold">{code}</Typography>
                      <Tooltip title={copiedCode === index ? "Copied!" : "Copy"}>
                        <IconButton size="small" onClick={() => copyToClipboard(code, index)}>
                          {copiedCode === index ? <CheckCircle color="success" /> : <ContentCopy />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Button
              fullWidth variant="outlined" startIcon={<ContentCopy />}
              onClick={copyAllCodes} sx={{ mb: 2 }}
            >
              Copy All Codes
            </Button>

            <Button
              fullWidth variant="contained" onClick={handleComplete}
              startIcon={<CheckCircle />}
              sx={{ background: 'linear-gradient(45deg, #2e7d32, #66bb6a)' }}
            >
              I've Saved My Backup Codes
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// 2FA Verification Dialog (for login)
export const TwoFactorVerify = ({ open, onClose, onVerify, loading }) => {
  const [code, setCode] = useState('');
  const [useBackup, setUseBackup] = useState(false);

  const handleSubmit = () => {
    onVerify(code, useBackup);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Shield sx={{ fontSize: 50, color: '#1a237e', mb: 1 }} />
        <Typography variant="h6" fontWeight="bold">
          {useBackup ? 'Enter Backup Code' : 'Two-Factor Authentication'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          {useBackup
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'}
        </Typography>

        <TextField
          fullWidth value={code}
          onChange={(e) => setCode(useBackup ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder={useBackup ? "Backup Code" : "000000"}
          disabled={loading}
          inputProps={{
            style: useBackup ? {} : { textAlign: 'center', letterSpacing: 10, fontSize: 24 }
          }}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth variant="contained" onClick={handleSubmit}
          disabled={loading || (!useBackup && code.length !== 6)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
          sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)', mb: 2 }}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>

        <Button fullWidth size="small" onClick={() => setUseBackup(!useBackup)}>
          {useBackup ? 'Use Authenticator App' : 'Use Backup Code Instead'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorSetup;