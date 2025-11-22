// web_app/client/src/components/Profile.js - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Avatar, Grid, Card,
  CardContent, Divider, Alert, CircularProgress, IconButton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Tabs, Tab, List, ListItem, ListItemIcon,
  ListItemText, Switch, Badge, Tooltip
} from '@mui/material';
import {
  Person, Email, Lock, Visibility, VisibilityOff, Edit, Save,
  Security, Shield, CheckCircle, Delete, Notifications,
  CalendarMonth, Assessment, CameraAlt, Phone, LocationOn,
  Business, Language, Close
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card sx={{ bgcolor: `${color}15`, border: `1px solid ${color}30`, height: '100%' }}>
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
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('profilePhoto') || '');

  const [formData, setFormData] = useState({
    fullName: localStorage.getItem('fullName') || '',
    username: user.username || '',
    email: user.email || '',
    phone: localStorage.getItem('phone') || '',
    location: localStorage.getItem('location') || '',
    organization: localStorage.getItem('organization') || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
    pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'false'),
    twoFactorAuth: false
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

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 2MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        localStorage.setItem('profilePhoto', reader.result);
        setMessage({ type: 'success', text: 'Profile photo updated!' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Save additional fields to localStorage
      localStorage.setItem('fullName', formData.fullName);
      localStorage.setItem('phone', formData.phone);
      localStorage.setItem('location', formData.location);
      localStorage.setItem('organization', formData.organization);

      // Update username and email via API
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
    localStorage.setItem(setting, JSON.stringify(newSettings[setting]));
  };

  const displayName = formData.fullName || (user.username?.includes('@') 
    ? user.username.split('@')[0].charAt(0).toUpperCase() + user.username.split('@')[0].slice(1)
    : user.username || 'User');

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Left Column - Profile Card */}
        <Grid item xs={12} md={3.5}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
            {/* Profile Photo */}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <label htmlFor="photo-upload">
                  <input
                    accept="image/*"
                    id="photo-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                  <IconButton
                    component="span"
                    sx={{
                      bgcolor: '#1a237e',
                      color: 'white',
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: '#0d1421' }
                    }}
                  >
                    <CameraAlt />
                  </IconButton>
                </label>
              }
            >
              <Avatar
                src={profilePhoto}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#1a237e',
                  fontSize: 48,
                  fontWeight: 'bold',
                  boxShadow: '0 8px 30px rgba(26,35,126,0.3)'
                }}
              >
                {!profilePhoto && displayName.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email || user.username}
            </Typography>
            
            {user.role === 'admin' && (
              <Chip icon={<Shield />} label="Administrator" color="primary" sx={{ mt: 1 }} />
            )}
            <Chip icon={<CheckCircle />} label="Verified" color="success" sx={{ mt: 1, ml: 1 }} />

            <Divider sx={{ my: 3 }} />

            {/* Additional Info */}
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              {formData.phone && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{formData.phone}</Typography>
                </Box>
              )}
              {formData.location && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{formData.location}</Typography>
                </Box>
              )}
              {formData.organization && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">{formData.organization}</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="space-around" sx={{ textAlign: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Scans
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="error">
                  {stats.fraud}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fraud Blocked
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="success">
                  {stats.valid}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Valid
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                  {stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Success Rate</Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#ef6c00">
                  {stats.flagged}
                </Typography>
                <Typography variant="caption" color="text.secondary">Flagged</Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Settings */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
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
                    {!editing ? (
                      <Button startIcon={<Edit />} variant="outlined" onClick={() => setEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <Box display="flex" gap={1}>
                        <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
                        <Button startIcon={<Save />} variant="contained" onClick={handleUpdateProfile} disabled={loading}>
                          Save Changes
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!editing || loading}
                        placeholder="Enter your full name"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!editing || loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editing || loading}
                        placeholder="your@email.com"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editing || loading}
                        placeholder="+91 98765 43210"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!editing || loading}
                        placeholder="City, Country"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        disabled={!editing || loading}
                        placeholder="Company or Institution"
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><Business /></InputAdornment>
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
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
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
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
                        helperText={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "Passwords don't match" : ''}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleChangePassword}
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
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </Box>
              )}

              {/* Preferences Tab */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Notification Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText
                        primary="Email Notifications"
                        secondary="Receive fraud alerts and reports via email"
                      />
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={() => handleSettingChange('emailNotifications')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Notifications /></ListItemIcon>
                      <ListItemText
                        primary="Push Notifications"
                        secondary="Get instant browser notifications"
                      />
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={() => handleSettingChange('pushNotifications')}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Security /></ListItemIcon>
                      <ListItemText
                        primary="Two-Factor Authentication"
                        secondary="Extra security layer (Coming soon)"
                      />
                      <Switch checked={settings.twoFactorAuth} disabled />
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
        <DialogTitle sx={{ color: 'error.main' }}>
          Delete Account?
        </DialogTitle>
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