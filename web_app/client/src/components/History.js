// web_app/client/src/components/History.js - Transaction Detail Modal section
// Replace the DialogActions in the TransactionDetailModal

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  TablePagination, TextField, InputAdornment, Avatar, Card,
  CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, LinearProgress, keyframes, Alert
} from '@mui/material';
import {
  Visibility, Search, History as HistoryIcon, Download, Delete,
  GppGood, GppBad, GppMaybe, Assessment, Close, PictureAsPdf
} from '@mui/icons-material';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Generate PDF for single transaction
const generateTransactionPDF = (transaction) => {
  const isFraud = transaction.prediction === 'Fraud';
  const riskLevel = transaction.riskScore >= 70 ? 'HIGH' : transaction.riskScore >= 40 ? 'MEDIUM' : 'LOW';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transaction Report - ${transaction.transactionId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
        .header { background: ${isFraud ? '#c62828' : '#1a237e'}; color: white; padding: 30px; margin: -40px -40px 30px; }
        .header h1 { font-size: 24px; margin-bottom: 5px; }
        .badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .badge-fraud { background: #ffebee; color: #c62828; }
        .badge-valid { background: #e8f5e9; color: #2e7d32; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .section-value { font-size: 20px; font-weight: bold; color: #333; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .card { background: #f5f7fa; padding: 20px; border-radius: 8px; }
        .risk-bar { height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; margin-top: 10px; }
        .risk-fill { height: 100%; background: ${isFraud ? '#c62828' : transaction.riskScore >= 40 ? '#ef6c00' : '#2e7d32'}; width: ${transaction.riskScore}%; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        @media print { body { padding: 20px; } .header { margin: -20px -20px 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ UPI Shield - Transaction Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <div class="badge ${isFraud ? 'badge-fraud' : 'badge-valid'}">
          ${isFraud ? '🚫 FRAUD DETECTED' : '✅ VERIFIED TRANSACTION'}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Transaction ID</div>
        <div class="section-value" style="font-family: monospace;">${transaction.transactionId}</div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="section-title">Amount</div>
          <div class="section-value">₹${transaction.details?.amount || 0}</div>
        </div>
        <div class="card">
          <div class="section-title">Risk Score</div>
          <div class="section-value">${transaction.riskScore}% (${riskLevel})</div>
          <div class="risk-bar"><div class="risk-fill"></div></div>
        </div>
        <div class="card">
          <div class="section-title">Prediction</div>
          <div class="section-value">${transaction.prediction}</div>
        </div>
        <div class="card">
          <div class="section-title">Confidence</div>
          <div class="section-value">${((transaction.confidence || 0.85) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Sender UPI ID</div>
        <div class="section-value">${transaction.details?.senderUpiId || 'N/A'}</div>
      </div>

      <div class="section">
        <div class="section-title">Receiver UPI ID</div>
        <div class="section-value">${transaction.details?.receiverUpiId || 'N/A'}</div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="section-title">Transaction Type</div>
          <div class="section-value">${transaction.details?.transactionType || 'P2P'}</div>
        </div>
        <div class="card">
          <div class="section-title">Analyzed At</div>
          <div class="section-value">${new Date(transaction.timestamp).toLocaleString()}</div>
        </div>
      </div>

      ${transaction.details?.location ? `
      <div class="section">
        <div class="section-title">Location</div>
        <div class="section-value">${transaction.details.location}</div>
      </div>
      ` : ''}

      <div class="footer">
        <p>© ${new Date().getFullYear()} UPI Shield - AI-Powered Fraud Detection System</p>
        <p>This report is confidential and for authorized use only.</p>
      </div>
    </body>
    </html>
  `;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

// Transaction Detail Modal - FIXED VERSION
const TransactionDetailModal = ({ open, onClose, transaction }) => {
  if (!transaction) return null;
  
  const isFraud = transaction.prediction === 'Fraud';
  const riskLevel = transaction.riskScore >= 70 ? 'high' : transaction.riskScore >= 40 ? 'medium' : 'low';

  const handleDownloadPDF = () => {
    generateTransactionPDF(transaction);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{
        background: isFraud ? 'linear-gradient(135deg, #c62828, #ef5350)' :
          riskLevel === 'medium' ? 'linear-gradient(135deg, #ef6c00, #ffa726)' :
            'linear-gradient(135deg, #2e7d32, #66bb6a)',
        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          {isFraud ? <GppBad sx={{ fontSize: 30 }} /> : 
           riskLevel === 'medium' ? <GppMaybe sx={{ fontSize: 30 }} /> : 
           <GppGood sx={{ fontSize: 30 }} />}
          <Typography variant="h6" fontWeight="bold">Transaction Details</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}><Close /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2, mb: 3 }}>
          <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
          <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
            {transaction.transactionId}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Amount</Typography>
            <Typography variant="h5" fontWeight="bold">₹{transaction.details?.amount}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Risk Score</Typography>
            <Typography variant="h5" fontWeight="bold" color={
              riskLevel === 'high' ? 'error.main' : riskLevel === 'medium' ? 'warning.main' : 'success.main'
            }>
              {transaction.riskScore}%
            </Typography>
          </Grid>
          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">From</Typography>
            <Typography variant="body1" fontWeight="600">{transaction.details?.senderUpiId}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">To</Typography>
            <Typography variant="body1" fontWeight="600">{transaction.details?.receiverUpiId}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Typography variant="body1">{transaction.details?.transactionType}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Chip label={transaction.prediction} size="small" color={isFraud ? 'error' : 'success'} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Analyzed At</Typography>
            <Typography variant="body1">{new Date(transaction.timestamp).toLocaleString()}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#f5f7fa' }}>
        <Button startIcon={<PictureAsPdf />} variant="outlined" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Stats Card
const StatsCard = ({ icon: Icon, label, value, color, bgcolor }) => (
  <Card sx={{ bgcolor, border: 'none', boxShadow: 'none' }}>
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

const History = () => {
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    setLoading(true);
    const saved = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(saved);
    setTimeout(() => setLoading(false), 300);
  };

  const stats = {
    total: transactions.length,
    fraud: transactions.filter(t => t.prediction === 'Fraud').length,
    flagged: transactions.filter(t => t.riskScore >= 40 && t.riskScore < 70).length,
    valid: transactions.filter(t => t.prediction === 'Valid' && t.riskScore < 40).length,
  };

  const handleTabChange = (e, val) => { setTabValue(val); setPage(0); };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchTerm === '' ||
      t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details?.senderUpiId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.details?.receiverUpiId?.toLowerCase().includes(searchTerm.toLowerCase());

    if (tabValue === 1) return matchesSearch && t.prediction === 'Fraud';
    if (tabValue === 2) return matchesSearch && t.riskScore >= 40 && t.riskScore < 70;
    if (tabValue === 3) return matchesSearch && t.prediction === 'Valid';
    return matchesSearch;
  });

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage, page * rowsPerPage + rowsPerPage
  );

  const getStatusConfig = (tx) => {
    if (tx.prediction === 'Fraud') return { icon: <GppBad />, color: '#c62828', bg: '#ffebee', label: 'Fraud' };
    if (tx.riskScore >= 40) return { icon: <GppMaybe />, color: '#ef6c00', bg: '#fff3e0', label: 'Flagged' };
    return { icon: <GppGood />, color: '#2e7d32', bg: '#e8f5e9', label: 'Valid' };
  };

  const handleViewDetails = (tx) => { setSelectedTx(tx); setDetailOpen(true); };

  const handleDelete = (txId) => {
    const updated = transactions.filter(t => t.transactionId !== txId);
    setTransactions(updated);
    localStorage.setItem('transactions', JSON.stringify(updated));
  };

  const handleExportAll = () => {
    const headers = ['Transaction ID', 'Amount', 'Type', 'Sender', 'Receiver', 'Risk Score', 'Status', 'Date'];
    const rows = transactions.map(t => [
      t.transactionId,
      t.details?.amount || 0,
      t.details?.transactionType || 'P2P',
      t.details?.senderUpiId || '',
      t.details?.receiverUpiId || '',
      t.riskScore,
      t.prediction,
      new Date(t.timestamp).toISOString()
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f7fa' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 50, height: 50, bgcolor: '#1a237e' }}>
            <HistoryIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#1a237e">Transaction History</Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all analyzed transactions
            </Typography>
          </Box>
        </Box>
        <Button startIcon={<Download />} variant="outlined" onClick={handleExportAll} disabled={transactions.length === 0}>
          Export CSV
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={Assessment} label="Total" value={stats.total} color="#1a237e" bgcolor="#e8eaf6" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={GppBad} label="Fraud" value={stats.fraud} color="#c62828" bgcolor="#ffebee" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={GppMaybe} label="Flagged" value={stats.flagged} color="#ef6c00" bgcolor="#fff3e0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard icon={GppGood} label="Valid" value={stats.valid} color="#2e7d32" bgcolor="#e8f5e9" />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        {/* Search & Tabs */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Fraud (${stats.fraud})`} sx={{ color: '#c62828' }} />
            <Tab label={`Flagged (${stats.flagged})`} sx={{ color: '#ef6c00' }} />
            <Tab label={`Valid (${stats.valid})`} sx={{ color: '#2e7d32' }} />
          </Tabs>
          <TextField
            size="small" placeholder="Search transactions..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ width: 280 }}
          />
        </Box>

        {loading && <LinearProgress />}

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <HistoryIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No transactions found</Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try a different search term' : 'Start analyzing transactions to see them here'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>From / To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Risk Score</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTransactions.map((tx, i) => {
                    const config = getStatusConfig(tx);
                    return (
                      <TableRow key={i} hover sx={{
                        animation: `${fadeIn} 0.3s ease-out ${i * 0.05}s both`,
                        '&:hover': { bgcolor: '#fafafa' }
                      }}>
                        <TableCell>
                          <Chip icon={config.icon} label={config.label} size="small"
                            sx={{ bgcolor: config.bg, color: config.color, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {tx.transactionId?.substring(0, 12)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">₹{tx.details?.amount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block" noWrap sx={{ maxWidth: 150 }}>
                            {tx.details?.senderUpiId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ maxWidth: 150 }}>
                            → {tx.details?.receiverUpiId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress variant="determinate" value={tx.riskScore}
                              sx={{
                                width: 60, height: 6, borderRadius: 3,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': { bgcolor: config.color, borderRadius: 3 }
                              }}
                            />
                            <Typography variant="body2" fontWeight="600">{tx.riskScore}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(tx.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => handleViewDetails(tx)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(tx.transactionId)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div" count={filteredTransactions.length}
              page={page} onPageChange={(e, p) => setPage(p)}
              rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      <TransactionDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} transaction={selectedTx} />
    </Box>
  );
};

export default History;