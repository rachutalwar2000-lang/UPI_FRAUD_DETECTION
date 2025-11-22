// web_app/client/src/theme/theme.js
import { createTheme } from '@mui/material';

// UPI Fraud Detection Theme - Professional Banking Colors
export const upiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // Deep Indigo - Trust & Security
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00695c', // Teal - Success/Valid
      light: '#439889',
      dark: '#003d33',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c62828', // Deep Red - Fraud Alert
      light: '#ff5f52',
      dark: '#8e0000',
    },
    warning: {
      main: '#ef6c00', // Orange - Flagged/Review
      light: '#ff9d3f',
      dark: '#b53d00',
    },
    success: {
      main: '#2e7d32', // Green - Valid Transaction
      light: '#60ad5e',
      dark: '#005005',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
      gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#4a4a68',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 2px 4px rgba(26,35,126,0.08)',
    '0 4px 8px rgba(26,35,126,0.12)',
    '0 8px 16px rgba(26,35,126,0.16)',
    '0 12px 24px rgba(26,35,126,0.20)',
    '0 16px 32px rgba(26,35,126,0.24)',
    ...Array(19).fill('0 16px 32px rgba(26,35,126,0.24)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(26,35,126,0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(26,35,126,0.35)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(26,35,126,0.08)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(26,35,126,0.15)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': { borderColor: '#1a237e' },
            '&.Mui-focused fieldset': { borderWidth: 2 },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #1a237e 0%, #283593 100%)',
          boxShadow: '0 4px 20px rgba(26,35,126,0.3)',
        },
      },
    },
  },
});

// Dark Theme Variant
export const upiDarkTheme = createTheme({
  ...upiTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#5c6bc0', light: '#8e99a4', dark: '#26418f' },
    secondary: { main: '#4db6ac', light: '#82e9de', dark: '#00867d' },
    error: { main: '#ef5350', light: '#ff867c', dark: '#b61827' },
    warning: { main: '#ffa726', light: '#ffd95b', dark: '#c77800' },
    success: { main: '#66bb6a', light: '#98ee99', dark: '#338a3e' },
    background: { default: '#0d1421', paper: '#1a2332' },
    text: { primary: '#e8eaed', secondary: '#9aa0a6' },
  },
});

export default upiTheme;