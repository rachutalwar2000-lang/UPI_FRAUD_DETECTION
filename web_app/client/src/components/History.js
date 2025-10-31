import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Mock Data (replace this with API data later) ---
const mockTransactions = [
  { id: 'UPI176182947...', status: 'fraud', amount: '₹20,000', sender: 'priya.patel@googlepay', receiver: 'fake.merchant@upi', risk: 100, time: '10/30/2025, 6:34:32 PM' },
  { id: 'UPI176182904...', status: 'safe', amount: '₹50,000', sender: 'dhanush.user@googlepay', receiver: 'rachana.merchant@upi', risk: 10, time: '10/30/2025, 6:27:22 PM' },
  { id: 'UPI176182891...', status: 'fraud', amount: '₹2,00,000', sender: 'scam.user@paytm', receiver: 'merchant@paytm', risk: 100, time: '10/30/2025, 6:25:15 PM' },
  { id: 'UPI176182869...', status: 'flagged', amount: '₹99,999', sender: 'test.user@paytm', receiver: 'scam.merchant@upi', risk: 40, time: '10/30/2025, 6:21:37 PM' },
  { id: 'UPI176182853...', status: 'flagged', amount: '₹5,00,000', sender: 'priya.patel@googlepay', receiver: 'merchant.store@paytm', risk: 40, time: '10/30/2025, 6:18:56 PM' },
];
// ----------------------------------------------------

// Helper function to get color for risk score
const getRiskColor = (risk) => {
  if (risk > 90) return 'error';
  if (risk > 30) return 'warning';
  return 'success';
};

const History = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredTransactions = mockTransactions.filter(t => {
    if (tabValue === 1) return t.status === 'fraud';
    if (tabValue === 2) return t.status === 'flagged';
    if (tabValue === 3) return t.status === 'safe';
    return true; // "All" tab
  });

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Recent Transactions
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All" />
          <Tab label="Fraud" />
          <Tab label="Flagged" />
          <Tab label="Safe" />
        </Tabs>
      </Box>

      <TableContainer sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Sender</TableCell>
              <TableCell>Receiver</TableCell>
              <TableCell>Risk Score</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.status === 'safe' ? 
                    <CheckCircleIcon color="success" /> : 
                    <CancelIcon color={row.status === 'fraud' ? 'error' : 'warning'} />
                  }
                </TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.sender}</TableCell>
                <TableCell>{row.receiver}</TableCell>
                <TableCell>
                  <Chip label={`${row.risk}%`} color={getRiskColor(row.risk)} size="small" />
                </TableCell>
                <TableCell>{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default History;
