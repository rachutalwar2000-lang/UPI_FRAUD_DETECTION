// src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ShieldIcon from '@mui/icons-material/Shield';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <ShieldIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          UPI Fraud Detection
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          <Button color="inherit" component={Link} to="/analyze">Analyze Transaction</Button>
          <Button color="inherit" component={Link} to="/history">History</Button>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;