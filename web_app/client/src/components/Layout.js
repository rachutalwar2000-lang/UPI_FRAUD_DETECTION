// web_app/client/src/components/Layout.js
import React from 'react';
import { Box, useTheme } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ children, darkMode, setDarkMode }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      transition: 'background-color 0.3s ease'
    }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Box 
        component="main" 
        sx={{ 
          minHeight: 'calc(100vh - 64px)',
          // No padding here - let individual pages control their padding
        }}
      >
        {children}
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 3,
          textAlign: 'center',
          bgcolor: theme.palette.mode === 'dark' ? '#0d1421' : '#f5f7fa',
          borderTop: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.secondary,
          fontSize: '0.875rem'
        }}
      >
        © {new Date().getFullYear()} UPI Shield - Fraud Detection System. 
        All rights reserved. | Built with AI & Machine Learning
      </Box>
    </Box>
  );
};

export default Layout;