// web_app/client/src/components/Register.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Container, Paper,
  Alert, CircularProgress, InputAdornment, IconButton, Link,
  Divider, LinearProgress, keyframes, Stepper, Step, StepLabel
} from '@mui/material';
import {
  Visibility, VisibilityOff, PersonAdd, Security,
  Email, Person, Lock, CheckCircle, Shield, AccountBalance
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(-5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

// Password strength calculator
const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 6) strength += 20;
  if (password.length >= 10) strength += 20;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
  return Math.min(strength, 100);
};

const getStrengthColor = (strength) => {
  if (strength < 30) return '#c62828';
  if (strength < 60) return '#ef6c00';
  if (strength < 80) return '#fbc02d';
  return '#2e7d32';
};

const getStrengthLabel = (strength) => {
  if (strength < 30) return 'Weak';
  if (strength < 60) return 'Fair';
  if (strength < 80) return 'Good';
  return 'Strong';
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Security />, text: 'Real-time Fraud Detection' },
    { icon: <CheckCircle />, text: '97%+ Accuracy Rate' },
    { icon: <Shield />, text: 'Bank Grade Security' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background Elements */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(5)].map((_, i) => (
          <Box key={i} sx={{
            position: 'absolute', width: 80 + i * 40, height: 80 + i * 40,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            animation: `${pulse} ${4 + i}s ease-in-out infinite`,
          }} />
        ))}
        <AccountBalance sx={{
          position: 'absolute', top: '15%', right: '10%',
          fontSize: 100, color: 'rgba(255,255,255,0.05)',
          animation: `${float} 7s ease-in-out infinite`,
        }} />
      </Box>

      {/* Left - Features */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', p: 6, position: 'relative', zIndex: 1,
      }}>
        <Box sx={{ textAlign: 'center', maxWidth: 450 }}>
          <Box sx={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <Shield sx={{ fontSize: 50, color: 'white' }} />
          </Box>
          <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
            Join UPI Shield
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mb: 4 }}>
            Start protecting your transactions with AI-powered fraud detection
          </Typography>

          {/* Features List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
            {features.map((feat, i) => (
              <Box key={i} sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}>
                <Box sx={{ color: '#4db6ac' }}>{feat.icon}</Box>
                <Typography color="white">{feat.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right - Form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', p: 3, position: 'relative', zIndex: 1,
      }}>
        <Paper elevation={24} sx={{
          p: 5, width: '100%', maxWidth: 480, borderRadius: 4,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00695c 0%, #4db6ac 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2, boxShadow: '0 8px 30px rgba(0,105,92,0.3)',
            }}>
              <PersonAdd sx={{ fontSize: 35, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="#1a237e">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Get started with UPI fraud protection
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required label="Username" name="username"
              value={formData.username} onChange={handleChange} disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Person color="primary" /></InputAdornment>,
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth label="Email (Optional)" name="email" type="email"
              value={formData.email} onChange={handleChange} disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Email color="primary" /></InputAdornment>,
              }}
              sx={{ mb: 2.5 }}
            />

            <TextField
              fullWidth required name="password" label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password} onChange={handleChange} disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Password Strength</Typography>
                  <Typography variant="caption" sx={{ color: getStrengthColor(passwordStrength), fontWeight: 600 }}>
                    {getStrengthLabel(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate" value={passwordStrength}
                  sx={{
                    height: 6, borderRadius: 3, bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStrengthColor(passwordStrength),
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth required name="confirmPassword" label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword} onChange={handleChange} disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock color="primary" /></InputAdornment>,
              }}
              error={formData.confirmPassword && formData.password !== formData.confirmPassword}
              helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords don't match" : ''}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading || passwordStrength < 40}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
              sx={{
                py: 1.5, fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #00695c 30%, #4db6ac 90%)',
                '&:hover': { background: 'linear-gradient(45deg, #004d40 30%, #00695c 90%)' },
              }}
            >
              {loading ? 'Creating Account...' : 'Create Secure Account'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">Already have an account?</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined" size="large"
              onClick={() => navigate('/login')}
              sx={{ py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              Sign In Instead
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Register;