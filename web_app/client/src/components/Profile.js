// web_app/client/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Avatar, Grid, Card,
  CardContent, Divider, Alert, CircularProgress, IconButton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, LinearProgress, Tabs, Tab, List, ListItem, ListItemIcon,
  ListItemText, Switch, keyframes
} from '@mui/material';
import {
  Person, Email, Lock, Visibility, VisibilityOff, Edit, Save,
  Security, Shield, History, Assessment, Delete, CheckCircle,
  Warning, Smartphone, LocationOn, CalendarMonth, TrendingUp,
  Notifications, DarkMode, Language
} from '@mui/icons-material';
import axios from 'axios';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card sx={{ bgcolor: `${color}15`, border: `1px solid ${color}30` }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
        <Icon />
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight="bold">{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, fraud: 0, valid: 0, flagged: 0 });

  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactorAuth: false,
    darkMode: localStorage.getItem('darkMode') === 'true'
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setStats({
      total: transactions.length,
      fraud: transactions.filter(t => t.prediction === 'Fraud').length,
      valid: transactions.filter(t => t.prediction === 'Valid').length,
      flagged: transactions.filter(t => t.riskScore >= 40 && t.riskScore < 70).length
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5001/api/auth/profile',
        { username: formData.username, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5001/api/auth/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.msg || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5001/api/auth/account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
      setLoading(false);
    }
  };

  const handleSettingChange = (setting) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    setSettings(newSettings);
    if (setting === 'darkMode') {
      localStorage.setItem('darkMode', newSettings.darkMode);
      window.location.reload();
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f7fa' }}>
      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{
            p: 4, borderRadius: 3, border: '1px solid #e0e0e0',
            textAlign: 'center', animation: `${fadeIn} 0.5s ease-out`
          }}>
            <Avatar sx={{
              width: 120, height: 120, mx: 'auto', mb: 3,
              bgcolor: '#1a237e', fontSize: 48, fontWeight: 'bold',
              boxShadow: '0 8px 30px rgba(26,35,126,0.3)'
            }}>
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </Avatar>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {user.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email || 'No email set'}
            </Typography>

            <Chip
              icon={<CheckCircle />}
              label="Verified Account"
              color="success"
              sx={{ mt: 2 }}
            />

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CalendarMonth color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Member Since</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Assessment color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Analyses</Typography>
                  <Typography variant="body2" fontWeight="600">{stats.total}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatCard icon={Shield} label="Fraud Blocked" value={stats.fraud} color="#c62828" />
              </Grid>
              <Grid item xs={6}>
                <StatCard icon={CheckCircle} label="Valid" value={stats.valid} color="#2e7d32" />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Right Column - Settings */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{
            borderRadius: 3, border: '1px solid #e0e0e0',
            animation: `${fadeIn} 0.5s ease-out 0.1s both`
          }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}>
              <Tab icon={<Person />} label="Profile" iconPosition="start" />
              <Tab icon={<Lock />} label="Security" iconPosition="start" />
              <Tab icon={<Notifications />} label="Preferences" iconPosition="start" />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {message.text && (
                <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}

              {/* Profile Tab */}
              {tabValue === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">Profile Information</Typography>
                    <Button
                      startIcon={editing ? <Save /> : <Edit />}
                      variant={editing ? "contained" : "outlined"}
                      onClick={() => editing ? handleUpdateProfile() : setEditing(true)}
                      disabled={loading}
                    >
                      {editing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="Username" name="username"
                        value={formData.username} onChange={handleChange}
                        disabled={!editing || loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="Email" name="email" type="email"
                        value={formData.email} onChange={handleChange}
                        disabled={!editing || loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Security Tab */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Change Password</Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Ensure your account is using a strong password
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth label="Current Password" name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword} onChange={handleChange}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="New Password" name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword} onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="Confirm Password" name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword} onChange={handleChange}
                        error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained" onClick={handleChangePassword}
                        disabled={loading || !formData.currentPassword || !formData.newPassword}
                        startIcon={loading ? <CircularProgress size={20} /> : <Security />}
                      >
                        Update Password
                      </Button>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" fontWeight="bold" color="error" gutterBottom>
                    Danger Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Once you delete your account, there is no going back.
                  </Typography>
                  <Button
                    variant="outlined" color="error" startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </Box>
              )}

              {/* Preferences Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Notification Settings</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText primary="Email Notifications" secondary="Receive alerts via email" />
                      <Switch checked={settings.emailNotifications} onChange={() => handleSettingChange('emailNotifications')} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Notifications /></ListItemIcon>
                      <ListItemText primary="Push Notifications" secondary="Browser push notifications" />
                      <Switch checked={settings.pushNotifications} onChange={() => handleSettingChange('pushNotifications')} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Security /></ListItemIcon>
                      <ListItemText primary="Two-Factor Authentication" secondary="Extra security layer" />
                      <Switch checked={settings.twoFactorAuth} onChange={() => handleSettingChange('twoFactorAuth')} />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" fontWeight="bold" gutterBottom>Appearance</Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><DarkMode /></ListItemIcon>
                      <ListItemText primary="Dark Mode" secondary="Toggle dark theme" />
                      <Switch checked={settings.darkMode} onChange={() => handleSettingChange('darkMode')} />
                    </ListItem>
                  </List>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account?</DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone. All your data, including transaction history, will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Delete Forever'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;