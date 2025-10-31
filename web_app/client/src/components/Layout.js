// src/components/Layout.js
import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <Box>
      <Navbar />
      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;