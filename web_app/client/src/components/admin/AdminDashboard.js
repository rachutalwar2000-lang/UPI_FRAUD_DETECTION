// web_app/client/src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, TextField, InputAdornment, Tabs, Tab, Divider,
  LinearProgress, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Tooltip, Badge, keyframes
} from '@mui/material';
import {
  Dashboard, People, Assessment, Security, TrendingUp, Warning,
  CheckCircle, Block, Search, MoreVert, Refresh, Download,
  AdminPanelSettings, GppBad, GppGood, Visibility, Delete,
  Person, VerifiedUser, DoNotDisturb, Edit
} from '@mui/icons-material';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderLeft: `4px solid ${color}`,
      transition: 'all 0.3s ease',
      '&:hover': onClick ? { transform: 'translateY(-5px)', boxShadow: 4 } : {}
    }}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>{value}</Typography>
          {trend && (
            <Chip
              size="small" label={trend}
              sx={{ mt: 1, bgcolor: `${color}20`, color }}
            />
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color }}>
          <Icon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// User Row Component
const UserRow = ({ user, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <TableRow hover>
      <TableCell>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: '#1a237e' }}>
            {user.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="600">{user.username}</Typography>
            <Typography variant="caption" color="text.secondary">{user.email || 'No email'}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
          label={user.role || 'User'}
          color={user.role === 'admin' ? 'primary' : 'default'}
        />
      </TableCell>
      <TableCell>{user.transactionCount || 0}</TableCell>
      <TableCell>
        <Chip
          size="small"
          icon={user.status === 'active' ? <CheckCircle /> : <DoNotDisturb />}
          label={user.status || 'Active'}
          color={user.status === 'active' ? 'success' : 'error'}
        />
      </TableCell>
      <TableCell>
        <Typography variant="caption">
          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
        </Typography>
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { onAction('view', user); setAnchorEl(null); }}>
            <Visibility sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem onClick={() => { onAction('edit', user); setAnchorEl(null); }}>
            <Edit sx={{ mr: 1 }} /> Edit User
          </MenuItem>
          <MenuItem onClick={() => { onAction('block', user); setAnchorEl(null); }}>
            <Block sx={{ mr: 1 }} /> {user.status === 'blocked' ? 'Unblock' : 'Block'} User
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { onAction('delete', user); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete User
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, totalTransactions: 0,
    fraudDetected: 0, fraudPrevented: 0, systemHealth: 98
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Demo data - in production, fetch from API
    const demoUsers = [
      { id: 1, username: 'john_doe', email: 'john@example.com', role: 'user', status: 'active', transactionCount: 45, createdAt: '2024-01-15', lastLogin: new Date() },
      { id: 2, username: 'admin', email: 'admin@upishield.com', role: 'admin', status: 'active', transactionCount: 120, createdAt: '2023-12-01', lastLogin: new Date() },
      { id: 3, username: 'sarah_k', email: 'sarah@example.com', role: 'user', status: 'active', transactionCount: 23, createdAt: '2024-02-20', lastLogin: '2024-03-10' },
      { id: 4, username: 'blocked_user', email: 'blocked@example.com', role: 'user', status: 'blocked', transactionCount: 5, createdAt: '2024-01-10', lastLogin: '2024-02-01' },
    ];

    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    setUsers(demoUsers);
    setTransactions(savedTransactions);
    setStats({
      totalUsers: demoUsers.length,
      activeUsers: demoUsers.filter(u => u.status === 'active').length,
      totalTransactions: savedTransactions.length,
      fraudDetected: savedTransactions.filter(t => t.prediction === 'Fraud').length,
      fraudPrevented: savedTransactions.filter(t => t.prediction === 'Fraud')
        .reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0),
      systemHealth: 98
    });

    setTimeout(() => setLoading(false), 500);
  };

  const handleUserAction = (action, user) => {
    setSelectedUser(user);
    setDialogType(action);
    if (action === 'view' || action === 'delete' || action === 'block') {
      setDialogOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (dialogType === 'delete') {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    } else if (dialogType === 'block') {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' }
          : u
      ));
    }
    setDialogOpen(false);
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f7fa' }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ width: 50, height: 50, bgcolor: '#1a237e' }}>
            <AdminPanelSettings />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#1a237e">Admin Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              System overview and management
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button startIcon={<Download />} variant="outlined">Export Data</Button>
          <Button startIcon={<Refresh />} variant="contained" onClick={loadData}
            sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}>
            Refresh
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon={People} label="Total Users" value={stats.totalUsers} color="#1a237e" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon={VerifiedUser} label="Active Users" value={stats.activeUsers} trend="+12%" color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon={Assessment} label="Transactions" value={stats.totalTransactions} color="#1565c0" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon={GppBad} label="Fraud Detected" value={stats.fraudDetected} color="#c62828" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon={Security} label="Amount Saved" value={`₹${(stats.fraudPrevented / 1000).toFixed(0)}K`} color="#ef6c00" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard icon={TrendingUp} label="System Health" value={`${stats.systemHealth}%`} color="#4caf50" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}>
          <Tab icon={<People />} label="Users" iconPosition="start" />
          <Tab icon={<Assessment />} label="Transactions" iconPosition="start" />
          <Tab icon={<Security />} label="Security" iconPosition="start" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Users Tab */}
          {tabValue === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <TextField
                  size="small" placeholder="Search users..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                  }}
                  sx={{ width: 300 }}
                />
                <Box display="flex" gap={1}>
                  <Chip label={`Active: ${stats.activeUsers}`} color="success" variant="outlined" />
                  <Chip label={`Blocked: ${users.filter(u => u.status === 'blocked').length}`} color="error" variant="outlined" />
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Transactions</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <UserRow key={user.id} user={user} onAction={handleUserAction} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Transactions Tab */}
          {tabValue === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Showing all transactions across the system. Use filters to narrow down results.
              </Alert>
              <Typography color="text.secondary">
                Total: {transactions.length} transactions | 
                Fraud: {transactions.filter(t => t.prediction === 'Fraud').length} | 
                Valid: {transactions.filter(t => t.prediction === 'Valid').length}
              </Typography>
              {/* Transaction table similar to History component */}
            </Box>
          )}

          {/* Security Tab */}
          {tabValue === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: '#f5f7fa' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Security Overview
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography>Failed Login Attempts (24h)</Typography>
                      <Chip label="3" color="warning" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography>Blocked IPs</Typography>
                      <Chip label="12" color="error" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>2FA Enabled Users</Typography>
                      <Chip label={`${Math.floor(stats.activeUsers * 0.6)}/${stats.activeUsers}`} color="success" size="small" />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, bgcolor: '#e8f5e9' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="#2e7d32">
                      <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                      System Status
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography>API Server</Typography>
                      <Chip label="Operational" color="success" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography>ML Service</Typography>
                      <Chip label="Operational" color="success" size="small" />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Database</Typography>
                      <Chip label="Operational" color="success" size="small" />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {dialogType === 'view' && `User: ${selectedUser?.username}`}
          {dialogType === 'delete' && 'Delete User?'}
          {dialogType === 'block' && `${selectedUser?.status === 'blocked' ? 'Unblock' : 'Block'} User?`}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'view' && selectedUser && (
            <Box>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
              <Typography><strong>Transactions:</strong> {selectedUser.transactionCount}</Typography>
              <Typography><strong>Status:</strong> {selectedUser.status}</Typography>
            </Box>
          )}
          {dialogType === 'delete' && (
            <Alert severity="warning">
              This action cannot be undone. All user data will be permanently deleted.
            </Alert>
          )}
          {dialogType === 'block' && (
            <Typography>
              {selectedUser?.status === 'blocked'
                ? 'This will restore the user\'s access to the system.'
                : 'This will prevent the user from accessing the system.'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {dialogType !== 'view' && (
            <Button
              color={dialogType === 'delete' ? 'error' : 'primary'}
              variant="contained"
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;