// web_app/client/src/components/ReportGenerator.js
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Typography, FormControl, InputLabel, Select, MenuItem, TextField,
  Checkbox, FormControlLabel, FormGroup, CircularProgress, Alert,
  Grid, LinearProgress, IconButton
} from '@mui/material';
import {
  PictureAsPdf, CheckCircle, Close, Description
} from '@mui/icons-material';

// PDF Generation utility (uses browser print or jsPDF)
const generatePDFReport = async (transactions, options) => {
  const { dateRange, includeCharts, reportType, title } = options;

  // Filter transactions by date range
  let filtered = [...transactions];
  if (dateRange.start) {
    filtered = filtered.filter(t => new Date(t.timestamp) >= new Date(dateRange.start));
  }
  if (dateRange.end) {
    filtered = filtered.filter(t => new Date(t.timestamp) <= new Date(dateRange.end));
  }

  // Filter by report type
  if (reportType === 'fraud') {
    filtered = filtered.filter(t => t.prediction === 'Fraud');
  } else if (reportType === 'flagged') {
    filtered = filtered.filter(t => t.riskScore >= 40 && t.riskScore < 70);
  } else if (reportType === 'valid') {
    filtered = filtered.filter(t => t.prediction === 'Valid');
  }

  // Calculate statistics
  const stats = {
    total: filtered.length,
    totalAmount: filtered.reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0),
    fraudCount: filtered.filter(t => t.prediction === 'Fraud').length,
    validCount: filtered.filter(t => t.prediction === 'Valid').length,
    flaggedCount: filtered.filter(t => t.riskScore >= 40 && t.riskScore < 70).length,
    avgRiskScore: filtered.length > 0 
      ? (filtered.reduce((sum, t) => sum + t.riskScore, 0) / filtered.length).toFixed(1)
      : 0,
    fraudAmount: filtered.filter(t => t.prediction === 'Fraud')
      .reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0)
  };

  // Generate HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
        .header { background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%); color: white; padding: 30px; margin: -40px -40px 30px; }
        .header h1 { font-size: 28px; margin-bottom: 5px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #1a237e; }
        .stat-card.fraud { border-left-color: #c62828; }
        .stat-card.valid { border-left-color: #2e7d32; }
        .stat-card.flagged { border-left-color: #ef6c00; }
        .stat-value { font-size: 28px; font-weight: bold; color: #1a237e; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .section-title { font-size: 18px; font-weight: bold; margin: 30px 0 15px; color: #1a237e; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
        th { background: #f5f7fa; font-weight: 600; color: #333; }
        tr:hover { background: #fafafa; }
        .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .badge-fraud { background: #ffebee; color: #c62828; }
        .badge-valid { background: #e8f5e9; color: #2e7d32; }
        .badge-flagged { background: #fff3e0; color: #ef6c00; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛡️ ${title}</h1>
        <p>Generated on ${new Date().toLocaleString()} | UPI Shield Fraud Detection System</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Total Transactions</div>
        </div>
        <div class="stat-card fraud">
          <div class="stat-value" style="color: #c62828">${stats.fraudCount}</div>
          <div class="stat-label">Fraud Detected</div>
        </div>
        <div class="stat-card flagged">
          <div class="stat-value" style="color: #ef6c00">${stats.flaggedCount}</div>
          <div class="stat-label">Flagged</div>
        </div>
        <div class="stat-card valid">
          <div class="stat-value" style="color: #2e7d32">${stats.validCount}</div>
          <div class="stat-label">Valid</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">₹${(stats.totalAmount / 1000).toFixed(1)}K</div>
          <div class="stat-label">Total Amount</div>
        </div>
        <div class="stat-card fraud">
          <div class="stat-value" style="color: #c62828">₹${(stats.fraudAmount / 1000).toFixed(1)}K</div>
          <div class="stat-label">Fraud Prevented</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.avgRiskScore}%</div>
          <div class="stat-label">Avg Risk Score</div>
        </div>
        <div class="stat-card valid">
          <div class="stat-value" style="color: #2e7d32">${stats.total > 0 ? ((stats.validCount / stats.total) * 100).toFixed(1) : 0}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>

      <div class="section-title">📋 Transaction Details</div>
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Risk Score</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.slice(0, 50).map(t => `
            <tr>
              <td style="font-family: monospace; font-size: 11px;">${t.transactionId?.substring(0, 15)}...</td>
              <td><strong>₹${t.details?.amount || 0}</strong></td>
              <td>${t.details?.transactionType || 'P2P'}</td>
              <td style="font-size: 11px;">${t.details?.senderUpiId?.substring(0, 20) || 'N/A'}</td>
              <td style="font-size: 11px;">${t.details?.receiverUpiId?.substring(0, 20) || 'N/A'}</td>
              <td><strong>${t.riskScore}%</strong></td>
              <td><span class="badge badge-${t.prediction === 'Fraud' ? 'fraud' : t.riskScore >= 40 ? 'flagged' : 'valid'}">${t.prediction}</span></td>
              <td style="font-size: 11px;">${new Date(t.timestamp).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${filtered.length > 50 ? `<p style="text-align: center; color: #666; margin-top: 15px;">Showing 50 of ${filtered.length} transactions</p>` : ''}

      <div class="footer">
        <p>© ${new Date().getFullYear()} UPI Shield - Fraud Detection System</p>
        <p>This report is confidential and intended for authorized personnel only.</p>
      </div>
    </body>
    </html>
  `;

  return { htmlContent, stats, filtered };
};

const ReportGenerator = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [options, setOptions] = useState({
    title: 'Transaction Analysis Report',
    reportType: 'all',
    dateRange: { start: '', end: '' },
    includeCharts: true,
    includeSummary: true,
    includeDetails: true
  });
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setProgress(0);
    setError('');

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const result = await generatePDFReport(transactions, options);

      clearInterval(interval);
      setProgress(100);

      // Open print dialog with generated HTML
      const printWindow = window.open('', '_blank');
      printWindow.document.write(result.htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        setGenerated(true);
        setLoading(false);
      }, 500);

    } catch (err) {
      setError('Failed to generate report');
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
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
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        color: 'white', display: 'flex', alignItems: 'center', gap: 2
      }}>
        <PictureAsPdf />
        <Box flex={1}>
          <Typography variant="h6" fontWeight="bold">Generate Report</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Export transaction analysis</Typography>
        </Box>
        <IconButton color="inherit" onClick={onClose}><Close /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Box textAlign="center" py={4}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>Generating Report...</Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, borderRadius: 2 }} />
            <Typography variant="caption" color="text.secondary">{progress}%</Typography>
          </Box>
        ) : generated ? (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" color="#2e7d32" gutterBottom>
              Report Generated!
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Your report has been opened in a new window for printing.
            </Typography>
            <Button variant="outlined" onClick={() => { setGenerated(false); }}>
              Generate Another Report
            </Button>
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth label="Report Title" value={options.title}
              onChange={(e) => setOptions({ ...options, title: e.target.value })}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={options.reportType}
                label="Report Type"
                onChange={(e) => setOptions({ ...options, reportType: e.target.value })}
              >
                <MenuItem value="all">All Transactions</MenuItem>
                <MenuItem value="fraud">Fraud Only</MenuItem>
                <MenuItem value="flagged">Flagged Only</MenuItem>
                <MenuItem value="valid">Valid Only</MenuItem>
              </Select>
            </FormControl>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth type="date" label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={options.dateRange.start}
                  onChange={(e) => setOptions({
                    ...options,
                    dateRange: { ...options.dateRange, start: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth type="date" label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={options.dateRange.end}
                  onChange={(e) => setOptions({
                    ...options,
                    dateRange: { ...options.dateRange, end: e.target.value }
                  })}
                />
              </Grid>
            </Grid>

            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={options.includeSummary} onChange={(e) => setOptions({ ...options, includeSummary: e.target.checked })} />}
                label="Include Summary Statistics"
              />
              <FormControlLabel
                control={<Checkbox checked={options.includeDetails} onChange={(e) => setOptions({ ...options, includeDetails: e.target.checked })} />}
                label="Include Transaction Details"
              />
            </FormGroup>
          </Box>
        )}
      </DialogContent>

      {!loading && !generated && (
        <DialogActions sx={{ p: 2, gap: 1, bgcolor: '#f5f5f5' }}>
          <Button startIcon={<Description />} onClick={handleDownloadCSV}>
            Download CSV
          </Button>
          <Button
            variant="contained" startIcon={<PictureAsPdf />}
            onClick={handleGenerate}
            sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
          >
            Generate PDF
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportGenerator;