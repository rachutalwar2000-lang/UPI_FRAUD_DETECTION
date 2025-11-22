// web_app/client/src/components/ForgotPassword.js
import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  InputAdornment, Stepper, Step, StepLabel, keyframes
} from '@mui/material';
import { Email, Lock, Shield, ArrowBack, CheckCircle, Key } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
`;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');
  
  const [step, setStep] = useState(resetToken ? 2 : 0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];

  const handleSendOTP = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
      setMessage({ type: 'success', text: 'OTP sent to your email!' });
      setStep(1);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter valid 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/auth/verify-otp', { email, otp });
      setMessage({ type: 'success', text: 'OTP verified!' });
      setStep(2);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Invalid OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/auth/reset-password', {
        email,
        otp,
        newPassword,
        token: resetToken
      });
      setMessage({ type: 'success', text: 'Password reset successfully!' });
      setStep(3);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
      p: 3, position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative Elements */}
      <Shield sx={{
        position: 'absolute', top: '10%', left: '5%', fontSize: 100,
        color: 'rgba(255,255,255,0.05)', animation: `${float} 6s ease-in-out infinite`
      }} />

      <Paper elevation={24} sx={{
        p: 5, width: '100%', maxWidth: 500, borderRadius: 4,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)'
      }}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Box sx={{
            width: 70, height: 70, borderRadius: '50%', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(26,35,126,0.3)'
          }}>
            <Key sx={{ fontSize: 35, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" color="#1a237e">
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {step === 0 && "Enter your email to receive a verification code"}
            {step === 1 && "Enter the 6-digit code sent to your email"}
            {step === 2 && "Create a new secure password"}
            {step === 3 && "Your password has been reset!"}
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}

        {/* Step 0: Email Input */}
        {step === 0 && (
          <Box>
            <TextField
              fullWidth label="Email Address" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
              }}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth variant="contained" size="large" onClick={handleSendOTP}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Email />}
              sx={{
                py: 1.5, background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)',
                '&:hover': { background: 'linear-gradient(45deg, #0d1421 30%, #1a237e 90%)' }
              }}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </Box>
        )}

        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <Box>
            <TextField
              fullWidth label="6-Digit OTP" value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: 10, fontSize: 24 } }}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth variant="contained" size="large" onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              sx={{ py: 1.5, background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)' }}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <Button fullWidth sx={{ mt: 2 }} onClick={() => setStep(0)}>
              Didn't receive code? Resend
            </Button>
          </Box>
        )}

        {/* Step 2: New Password */}
        {step === 2 && (
          <Box>
            <TextField
              fullWidth label="New Password" type="password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Confirm Password" type="password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              error={confirmPassword && newPassword !== confirmPassword}
              helperText={confirmPassword && newPassword !== confirmPassword ? "Passwords don't match" : ''}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>
              }}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth variant="contained" size="large" onClick={handleResetPassword}
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
              sx={{ py: 1.5, background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)' }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </Box>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="#2e7d32" gutterBottom>
              Password Reset Successful!
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Redirecting you to login...
            </Typography>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Back to Login */}
        <Button
          fullWidth startIcon={<ArrowBack />} sx={{ mt: 3 }}
          onClick={() => navigate('/login')}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;