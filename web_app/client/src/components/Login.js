// web_app/client/src/components/Login.js
import React, { useState } from 'react';
import {
  TextField, Button, Box, Typography, Container, Paper,
  Alert, CircularProgress, InputAdornment, IconButton, Link,
  Divider, Checkbox, FormControlLabel, keyframes
} from '@mui/material';
import {
  Visibility, VisibilityOff, Security, Login as LoginIcon,
  Shield, AccountBalance, Fingerprint, LockOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.response?.data?.msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0d1421 0%, #1a237e 50%, #283593 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background Elements */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: 100 + i * 50,
            height: 100 + i * 50,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `${pulse} ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}
        <Shield sx={{
          position: 'absolute', top: '10%', left: '5%',
          fontSize: 80, color: 'rgba(255,255,255,0.05)',
          animation: `${float} 6s ease-in-out infinite`,
        }} />
        <AccountBalance sx={{
          position: 'absolute', bottom: '15%', right: '8%',
          fontSize: 100, color: 'rgba(255,255,255,0.05)',
          animation: `${float} 8s ease-in-out infinite`,
          animationDelay: '1s',
        }} />
      </Box>

      {/* Left Side - Branding */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' },
        flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', p: 6, position: 'relative', zIndex: 1,
      }}>
        <Box sx={{ textAlign: 'center', animation: `${slideIn} 1s ease-out` }}>
          <Box sx={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <Security sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
            UPI Shield
          </Typography>
          <Typography variant="h5" color="rgba(255,255,255,0.8)" gutterBottom>
            Fraud Detection System
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.6)" sx={{ maxWidth: 400, mt: 3 }}>
            Advanced AI-powered protection for your UPI transactions.
            Detect fraud in real-time with 97%+ accuracy.
          </Typography>
          
          {/* Feature Pills */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Real-time Analysis', 'AI Powered', 'Bank Grade Security'].map((feat, i) => (
              <Box key={i} sx={{
                px: 3, py: 1, borderRadius: 20,
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <Typography variant="body2" color="white">{feat}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', p: 3, position: 'relative', zIndex: 1,
      }}>
        <Paper elevation={24} sx={{
          p: 5, width: '100%', maxWidth: 450, borderRadius: 4,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2, boxShadow: '0 8px 30px rgba(26,35,126,0.3)',
            }}>
              <LockOutlined sx={{ fontSize: 35, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="#1a237e">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to access your fraud detection dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth required label="Username" name="username"
              autoComplete="username" autoFocus
              value={formData.username} onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Fingerprint color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth required name="password" label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password} onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Link href="#" variant="body2" sx={{ fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              sx={{
                py: 1.5, fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #1a237e 30%, #3949ab 90%)',
                '&:hover': { background: 'linear-gradient(45deg, #0d1421 30%, #1a237e 90%)' },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In Securely'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">New to UPI Shield?</Typography>
            </Divider>

            <Button
              fullWidth variant="outlined" size="large"
              onClick={() => navigate('/register')}
              sx={{ py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              Create Account
            </Button>
          </Box>

          {/* Security Badge */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Shield sx={{ fontSize: 18, color: '#2e7d32' }} />
              <Typography variant="caption" color="text.secondary">
                256-bit SSL Encrypted • Bank Grade Security
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;