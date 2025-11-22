// web_app/client/src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, Container } from '@mui/material';

import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import History from './components/History';
import Analytics from './components/Analytics';
import BatchProcessing from './components/BatchProcessing';
import Profile from './components/Profile';


// UPI Shield Theme Configuration
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' ? {
      primary: { main: '#1a237e', light: '#534bae', dark: '#000051' },
      secondary: { main: '#00695c', light: '#439889', dark: '#003d33' },
      error: { main: '#c62828', light: '#ff5f52', dark: '#8e0000' },
      warning: { main: '#ef6c00', light: '#ff9d3f', dark: '#b53d00' },
      success: { main: '#2e7d32', light: '#60ad5e', dark: '#005005' },
      background: { default: '#f5f7fa', paper: '#ffffff' },
      text: { primary: '#1a1a2e', secondary: '#4a4a68' },
    } : {
      primary: { main: '#5c6bc0', light: '#8e99a4', dark: '#26418f' },
      secondary: { main: '#4db6ac', light: '#82e9de', dark: '#00867d' },
      error: { main: '#ef5350', light: '#ff867c', dark: '#b61827' },
      warning: { main: '#ffa726', light: '#ffd95b', dark: '#c77800' },
      success: { main: '#66bb6a', light: '#98ee99', dark: '#338a3e' },
      background: { default: '#0d1421', paper: '#1a2332' },
      text: { primary: '#e8eaed', secondary: '#9aa0a6' },
    }),
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '10px 24px', fontSize: '0.95rem' },
        contained: {
          boxShadow: '0 4px 14px rgba(26,35,126,0.25)',
          '&:hover': { boxShadow: '0 6px 20px rgba(26,35,126,0.35)', transform: 'translateY(-2px)' },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' ? '0 4px 20px rgba(26,35,126,0.08)' : '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': { boxShadow: mode === 'light' ? '0 8px 30px rgba(26,35,126,0.15)' : '0 8px 30px rgba(0,0,0,0.4)' },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': { borderColor: mode === 'light' ? '#1a237e' : '#5c6bc0' },
            '&.Mui-focused fieldset': { borderWidth: 2 },
          },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute><ForgotPassword /></PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analyze" element={
            <ProtectedRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <TransactionForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <History />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/batch" element={
            <ProtectedRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <BatchProcessing />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;