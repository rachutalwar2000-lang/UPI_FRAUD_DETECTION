// web_app/client/src/components/Navbar.js
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem,
  Divider, IconButton, Drawer, List, ListItem, ListItemIcon,
  ListItemText, useMediaQuery, useTheme, Tooltip
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, Dashboard, Analytics as AnalyticsIcon, History, ExitToApp, Person,
  Menu as MenuIcon, DarkMode, LightMode, Settings, Help,
  CloudUpload, Assessment, AdminPanelSettings, TrendingUp
} from '@mui/icons-material';
import NotificationCenter from './NotificationCenter';
import ReportGenerator from './ReportGenerator';

const Navbar = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Analyze', path: '/analyze', icon: <Assessment /> },
    { label: 'History', path: '/history', icon: <History /> },
    { label: 'Analytics', path: '/analytics', icon: <TrendingUp /> },
    { label: 'Batch', path: '/batch', icon: <CloudUpload /> },
  ];

  // Add admin link if user is admin
  if (user.role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin', icon: <AdminPanelSettings /> });
  }

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Mobile Drawer
  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: '#1a237e' }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Avatar sx={{
          width: 60, height: 60, mx: 'auto', mb: 2,
          background: 'linear-gradient(135deg, #5c6bc0 0%, #3949ab 100%)',
        }}>
          <Shield sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h6" color="white" fontWeight="bold">UPI Shield</Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.7)">Fraud Detection</Typography>
      </Box>
      
      <List sx={{ p: 2 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              borderRadius: 2, mb: 1, cursor: 'pointer',
              bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} sx={{ color: 'white' }} />
          </ListItem>
        ))}
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
        
        <ListItem
          onClick={() => { navigate('/profile'); setMobileOpen(false); }}
          sx={{ borderRadius: 2, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><Person /></ListItemIcon>
          <ListItemText primary="Profile" sx={{ color: 'white' }} />
        </ListItem>
        
        <ListItem
          onClick={() => { setReportOpen(true); setMobileOpen(false); }}
          sx={{ borderRadius: 2, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><AnalyticsIcon /></ListItemIcon>
          <ListItemText primary="Generate Report" sx={{ color: 'white' }} />
        </ListItem>
      </List>

      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
        <Button
          fullWidth variant="outlined" startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        background: 'linear-gradient(90deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Toolbar sx={{ py: 1 }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: isMobile ? 1 : 0, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <Avatar sx={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}>
              <Shield sx={{ fontSize: 24 }} />
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                UPI Shield
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 10 }}>
                Fraud Detection
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, mx: 3, flex: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  size="small"
                  sx={{
                    color: 'white', px: 2, py: 1, borderRadius: 2,
                    fontWeight: isActive(item.path) ? 700 : 500,
                    fontSize: '0.875rem',
                    bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Side Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Report Generator */}
            {!isMobile && (
              <Tooltip title="Generate Report">
                <IconButton color="inherit" onClick={() => setReportOpen(true)}>
                  <AnalyticsIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Dark Mode Toggle */}
            {setDarkMode && (
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            )}

            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                cursor: 'pointer', ml: 1, px: 1.5, py: 0.5,
                borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#4db6ac', fontSize: 14 }}>
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              {!isMobile && (
                <Typography variant="body2" fontWeight="500" sx={{ maxWidth: 100 }} noWrap>
                  {user.username || 'User'}
                </Typography>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left" open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a237e' } }}
      >
        {drawer}
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Signed in as</Typography>
          <Typography variant="body1" fontWeight="bold">{user.username || 'User'}</Typography>
          {user.role === 'admin' && (
            <Typography variant="caption" color="primary">Administrator</Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/analytics'); setAnchorEl(null); }}>
          <ListItemIcon><TrendingUp fontSize="small" /></ListItemIcon>
          Analytics
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); }}>
          <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); }}>
          <ListItemIcon><Help fontSize="small" /></ListItemIcon>
          Help
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon><ExitToApp fontSize="small" color="error" /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Report Generator Dialog */}
      <ReportGenerator open={reportOpen} onClose={() => setReportOpen(false)} />
    </>
  );
};

export default Navbar;