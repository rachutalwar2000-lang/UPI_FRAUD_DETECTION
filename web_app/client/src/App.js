// web_app/client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

// --- Import Page Components ---
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import History from './components/History';

function App() {
  // Check if the user has a token in local storage
  const token = localStorage.getItem('token');

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes: Login and Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* If the user is NOT logged in:
            - Any path they try to visit will redirect them to the /login page.
          */}
          {!token && <Route path="*" element={<Navigate to="/login" />} />}

          {/* Protected Routes:
            - These routes are only accessible if the user IS logged in.
            - They are all wrapped inside the <Layout> component, which provides
              the main Navbar and page structure.
          */}
          {token && (
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analyze" element={<TransactionForm />} />
                  {/* <Route path="/history" element={<History />} /> */}
                  
                  {/* If a logged-in user tries to go to a non-existent path
                    or the root "/", redirect them to their dashboard.
                  */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            } />
          )}
        </Routes>
      </Router>
    </>
  );
}

export default App;
