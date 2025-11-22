// web_app/client/src/components/BatchProcessing.js
import React, { useState, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Stepper, Step, StepLabel, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Grid, Card, CardContent, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Tooltip
} from '@mui/material';
import {
  CloudUpload, PlayArrow, CheckCircle, Error, Warning, Download,
  Description, Close, Visibility, Assessment, GppBad, GppGood,
  GppMaybe, Speed, Timer, Refresh
} from '@mui/icons-material';
import axios from 'axios';

const BatchProcessing = () => {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, fraud: 0, valid: 0, flagged: 0 });
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const steps = ['Upload CSV', 'Preview Data', 'Process', 'Results'];

  // Parse CSV file
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(uploadedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('CSV file is empty or has no data rows');
          return;
        }

        // Parse headers - handle different formats
        const headerLine = lines[0].toLowerCase();
        const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));

        console.log('CSV Headers:', headers);

        // Map common column name variations
        const columnMap = {
          amount: headers.findIndex(h => 
            h.includes('amount') || h.includes('amt') || h.includes('value')
          ),
          sender: headers.findIndex(h => 
            h.includes('sender') || h.includes('from') || h.includes('payer')
          ),
          receiver: headers.findIndex(h => 
            h.includes('receiver') || h.includes('to') || h.includes('payee') || h.includes('recipient')
          ),
          type: headers.findIndex(h => 
            h.includes('type') || h.includes('category')
          ),
          device: headers.findIndex(h => 
            h.includes('device') || h.includes('deviceid')
          ),
          location: headers.findIndex(h => 
            h.includes('location') || h.includes('loc')
          )
        };

        console.log('Column mapping:', columnMap);

        // Validate required columns
        if (columnMap.amount === -1) {
          setError('Missing required column: Amount (or similar)');
          return;
        }
        if (columnMap.sender === -1) {
          setError('Missing required column: Sender/From (or similar)');
          return;
        }
        if (columnMap.receiver === -1) {
          setError('Missing required column: Receiver/To (or similar)');
          return;
        }

        // Parse data rows
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          
          return {
            id: index + 1,
            amount: values[columnMap.amount] || '',
            senderUpiId: values[columnMap.sender] || '',
            receiverUpiId: values[columnMap.receiver] || '',
            transactionType: values[columnMap.type] || 'P2P',
            deviceId: values[columnMap.device] || '',
            location: values[columnMap.location] || ''
          };
        }).filter(row => {
          // Filter out empty rows and validate data
          const hasAmount = row.amount && !isNaN(parseFloat(row.amount));
          const hasSender = row.senderUpiId && row.senderUpiId.length > 0;
          const hasReceiver = row.receiverUpiId && row.receiverUpiId.length > 0;
          return hasAmount && hasSender && hasReceiver;
        });

        console.log('Parsed data:', data);

        if (data.length === 0) {
          setError('No valid transactions found in CSV. Please check the format.');
          return;
        }

        setParsedData(data);
        setStep(1);
      } catch (err) {
        console.error('CSV parsing error:', err);
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(uploadedFile);
  };

  // Process all transactions
  const handleProcess = async () => {
    setProcessing(true);
    setStep(2);
    setProgress(0);
    setResults([]);

    const processedResults = [];
    const token = localStorage.getItem('token');

    for (let i = 0; i < parsedData.length; i++) {
      const transaction = parsedData[i];
      
      try {
        const response = await axios.post(
          'http://localhost:5001/api/detect',
          {
            amount: parseFloat(transaction.amount),
            senderUpiId: transaction.senderUpiId,
            receiverUpiId: transaction.receiverUpiId,
            transactionType: transaction.transactionType || 'P2P',
            deviceId: transaction.deviceId,
            location: transaction.location
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        processedResults.push({
          ...transaction,
          result: response.data,
          status: 'success'
        });
      } catch (err) {
        console.error('Error processing transaction:', err);
        processedResults.push({
          ...transaction,
          result: null,
          status: 'error',
          error: err.message
        });
      }

      setProgress(Math.round(((i + 1) / parsedData.length) * 100));
      setResults([...processedResults]);

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate stats
    const fraud = processedResults.filter(r => r.result?.prediction === 'Fraud').length;
    const valid = processedResults.filter(r => r.result?.prediction === 'Valid').length;
    const flagged = processedResults.filter(r => 
      r.result?.riskScore >= 40 && r.result?.riskScore < 70
    ).length;

    setStats({
      total: processedResults.length,
      fraud, valid, flagged,
      errors: processedResults.filter(r => r.status === 'error').length
    });

    // Save to localStorage
    const existingTx = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTx = processedResults
      .filter(r => r.result)
      .map(r => r.result);
    localStorage.setItem('transactions', JSON.stringify([...newTx, ...existingTx].slice(0, 500)));

    setProcessing(false);
    setStep(3);
  };

  // Download results as CSV
  const handleDownloadResults = () => {
    const headers = ['ID', 'Amount', 'Sender', 'Receiver', 'Type', 'Prediction', 'Risk Score', 'Status'];
    const rows = results.map(r => [
      r.id,
      r.amount,
      r.senderUpiId,
      r.receiverUpiId,
      r.transactionType,
      r.result?.prediction || 'Error',
      r.result?.riskScore || 'N/A',
      r.status
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to start
  const handleReset = () => {
    setStep(0);
    setFile(null);
    setParsedData([]);
    setResults([]);
    setProgress(0);
    setError('');
    setStats({ total: 0, fraud: 0, valid: 0, flagged: 0 });
  };

  const getStatusIcon = (result) => {
    if (!result?.result) return <Error color="error" />;
    if (result.result.prediction === 'Fraud') return <GppBad sx={{ color: '#c62828' }} />;
    if (result.result.riskScore >= 40) return <GppMaybe sx={{ color: '#ef6c00' }} />;
    return <GppGood sx={{ color: '#2e7d32' }} />;
  };

  return (
    <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f7fa' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Avatar sx={{ width: 50, height: 50, bgcolor: '#1a237e' }}>
          <CloudUpload />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1a237e">
            Batch Processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analyze multiple transactions at once
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Stepper activeStep={step} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Step 0: Upload */}
      {step === 0 && (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '2px dashed #1a237e', textAlign: 'center' }}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <CloudUpload sx={{ fontSize: 80, color: '#1a237e', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Upload CSV File
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Required columns: Amount, Sender (From/Payer), Receiver (To/Payee)
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<CloudUpload />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
          >
            Select CSV File
          </Button>

          <Box mt={4} p={2} bgcolor="#f5f7fa" borderRadius={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              CSV Format Example:
            </Typography>
            <Typography variant="caption" fontFamily="monospace" component="pre" textAlign="left">
              Amount,Sender,Receiver,Type{'\n'}
              5000,john@paytm,store@gpay,P2M{'\n'}
              15000,user@phonepe,merchant@upi,P2P
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Step 1: Preview */}
      {step === 1 && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preview Data
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {parsedData.length} transactions ready to process
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={handleReset}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleProcess}
                sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
              >
                Start Processing
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Sender</TableCell>
                  <TableCell>Receiver</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parsedData.slice(0, 100).map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>₹{row.amount}</TableCell>
                    <TableCell>{row.senderUpiId}</TableCell>
                    <TableCell>{row.receiverUpiId}</TableCell>
                    <TableCell>{row.transactionType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {parsedData.length > 100 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing 100 of {parsedData.length} rows
            </Typography>
          )}
        </Paper>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
          <Speed sx={{ fontSize: 80, color: '#1a237e', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Processing Transactions...
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {results.length} of {parsedData.length} completed
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5, mb: 2 }}
          />
          <Typography variant="h4" fontWeight="bold" color="primary">
            {progress}%
          </Typography>
        </Paper>
      )}

      {/* Step 3: Results */}
      {step === 3 && (
        <Box>
          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: '#e8eaf6' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="#1a237e">{stats.total}</Typography>
                  <Typography variant="body2">Total Processed</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="#c62828">{stats.fraud}</Typography>
                  <Typography variant="body2">Fraud Detected</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="#2e7d32">{stats.valid}</Typography>
                  <Typography variant="body2">Valid</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ bgcolor: '#fff3e0' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="#ef6c00">{stats.flagged}</Typography>
                  <Typography variant="body2">Flagged</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Results Table */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Results
              </Typography>
              <Box display="flex" gap={2}>
                <Button startIcon={<Refresh />} onClick={handleReset}>
                  Process New Batch
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownloadResults}
                  sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}
                >
                  Download Results
                </Button>
              </Box>
            </Box>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Sender</TableCell>
                    <TableCell>Receiver</TableCell>
                    <TableCell>Prediction</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{getStatusIcon(row)}</TableCell>
                      <TableCell>₹{row.amount}</TableCell>
                      <TableCell>{row.senderUpiId}</TableCell>
                      <TableCell>{row.receiverUpiId}</TableCell>
                      <TableCell>
                        {row.result?.prediction ? (
                          <Chip
                            size="small"
                            label={row.result.prediction}
                            color={row.result.prediction === 'Fraud' ? 'error' : 'success'}
                          />
                        ) : (
                          <Chip size="small" label="Error" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        {row.result?.riskScore !== undefined ? `${row.result.riskScore}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => { setSelectedResult(row); setDetailOpen(true); }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Transaction Details
          <IconButton onClick={() => setDetailOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedResult && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" fontWeight="bold">₹{selectedResult.amount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedResult.result?.riskScore || 'N/A'}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Sender</Typography>
                  <Typography>{selectedResult.senderUpiId}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Receiver</Typography>
                  <Typography>{selectedResult.receiverUpiId}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Prediction</Typography>
                  <Box mt={1}>
                    <Chip
                      icon={getStatusIcon(selectedResult)}
                      label={selectedResult.result?.prediction || 'Error'}
                      color={selectedResult.result?.prediction === 'Fraud' ? 'error' : 'success'}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BatchProcessing;