// web_app/client/src/components/Dashboard.js - FIXED FULL WIDTH v2
import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, LinearProgress,
  Chip, Paper, IconButton, Tooltip, keyframes, Avatar, Skeleton
} from '@mui/material';
import {
  TrendingUp, Warning, CheckCircle, CurrencyRupee, Assessment,
  Security, Refresh, ArrowUpward, ArrowDownward, Speed, Shield,
  Analytics, Timeline, GppGood, GppBad, GppMaybe
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, gradient, subtitle, trend, trendUp, delay = 0, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      height: '100%', cursor: onClick ? 'pointer' : 'default',
      background: gradient, color: 'white', position: 'relative', overflow: 'hidden',
      animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' },
    }}
  >
    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
    <CardContent sx={{ position: 'relative', zIndex: 1, p: 2.5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, mb: 0.5 }}>{title}</Typography>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          {subtitle && <Typography variant="caption" sx={{ opacity: 0.8 }}>{subtitle}</Typography>}
        </Box>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 45, height: 45 }}>
          <Icon sx={{ fontSize: 24 }} />
        </Avatar>
      </Box>
      {trend && (
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            icon={trendUp ? <ArrowUpward sx={{ fontSize: 12 }} /> : <ArrowDownward sx={{ fontSize: 12 }} />}
            label={trend}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-icon': { color: 'white' }, fontWeight: 600, height: 24 }}
          />
          <Typography variant="caption" sx={{ opacity: 0.8 }}>vs last week</Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

// Metric Progress Component
const MetricProgress = ({ title, value, target, color, icon: Icon, delay = 0 }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(parseInt(value)), delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Box sx={{ animation: `${fadeInUp} 0.6s ease-out ${delay}s both` }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon sx={{ fontSize: 18, color }} />
          <Typography variant="body2" fontWeight="600" color="text.secondary">{title}</Typography>
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color }}>{value}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={progress}
        sx={{ height: 8, borderRadius: 4, bgcolor: `${color}20`, '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Target: {target}%</Typography>
    </Box>
  );
};

// Recent Activity Item
const ActivityItem = ({ type, amount, time, status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Fraud': return { icon: <GppBad />, color: '#c62828', bg: '#ffebee' };
      case 'Flagged': return { icon: <GppMaybe />, color: '#ef6c00', bg: '#fff3e0' };
      default: return { icon: <GppGood />, color: '#2e7d32', bg: '#e8f5e9' };
    }
  };
  const config = getStatusConfig();

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: 2, bgcolor: config.bg, mb: 1,
      transition: 'all 0.2s ease', '&:hover': { transform: 'translateX(5px)' },
    }}>
      <Avatar sx={{ bgcolor: config.color, width: 36, height: 36 }}>{config.icon}</Avatar>
      <Box flex={1}>
        <Typography variant="body2" fontWeight="600">{type} Transaction</Typography>
        <Typography variant="caption" color="text.secondary">{time}</Typography>
      </Box>
      <Box textAlign="right">
        <Typography variant="body2" fontWeight="bold">₹{amount}</Typography>
        <Chip label={status} size="small" sx={{ bgcolor: config.color, color: 'white', fontSize: 10, height: 20 }} />
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTransactions: 0, fraudulent: 0, flagged: 0, valid: 0, totalAmount: 0, fraudPrevented: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadStats = () => {
    setLoading(true);
    const saved = JSON.parse(localStorage.getItem('transactions') || '[]');
    const fraudCount = saved.filter(t => t.prediction === 'Fraud').length;
    const flaggedCount = saved.filter(t => t.riskScore >= 40 && t.riskScore < 70).length;
    const validCount = saved.filter(t => t.prediction === 'Valid' && t.riskScore < 40).length;
    const totalAmount = saved.reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0);
    const fraudAmount = saved.filter(t => t.prediction === 'Fraud').reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0);

    setStats({ totalTransactions: saved.length, fraudulent: fraudCount, flagged: flaggedCount, valid: validCount, totalAmount: totalAmount.toFixed(0), fraudPrevented: fraudAmount.toFixed(0) });
    setRecentActivity(saved.slice(0, 5).map(t => ({ type: t.details?.transactionType || 'P2P', amount: t.details?.amount || '0', time: new Date(t.timestamp).toLocaleString(), status: t.prediction })));
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => { loadStats(); }, []);

  const refreshData = () => { loadStats(); setLastUpdated(new Date()); };
  const metrics = { accuracy: 97, precision: 95, recall: 92, f1Score: 93 };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: 'calc(100vh - 64px)', 
      bgcolor: '#f5f7fa',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1a237e" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield sx={{ fontSize: 32 }} /> Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, <strong>{user.username || 'User'}</strong> • Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData} sx={{ bgcolor: 'white', boxShadow: 2 }}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Analytics />} onClick={() => navigate('/analyze')} sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)' }}>
            Analyze New
          </Button>
        </Box>
      </Box>

      {/* Stats Cards - Full Width Row */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={6} md={3} lg={3}>
          <StatCard title="Total Analyzed" value={loading ? '...' : stats.totalTransactions} icon={Assessment} gradient="linear-gradient(135deg, #1a237e 0%, #3949ab 100%)" subtitle="All time" trend="+12%" trendUp delay={0} />
        </Grid>
        <Grid item xs={6} sm={6} md={3} lg={3}>
          <StatCard title="Fraud Blocked" value={loading ? '...' : stats.fraudulent} icon={Warning} gradient="linear-gradient(135deg, #c62828 0%, #ef5350 100%)" subtitle="Blocked" trend="-8%" trendUp={false} delay={0.1} onClick={() => navigate('/history')} />
        </Grid>
        <Grid item xs={6} sm={6} md={3} lg={3}>
          <StatCard title="Flagged Review" value={loading ? '...' : stats.flagged} icon={Security} gradient="linear-gradient(135deg, #ef6c00 0%, #ffa726 100%)" subtitle="Needs review" trend="+3%" trendUp delay={0.2} />
        </Grid>
        <Grid item xs={6} sm={6} md={3} lg={3}>
          <StatCard title="Amount Protected" value={loading ? '...' : `₹${(parseInt(stats.fraudPrevented) / 1000).toFixed(0)}K`} icon={CurrencyRupee} gradient="linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)" subtitle="Fraud prevented" trend="+25%" trendUp delay={0.3} />
        </Grid>
      </Grid>

      {/* Main Content - USING FLEXBOX FOR FULL WIDTH */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Model Performance - Takes more space */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          borderRadius: 3, 
          bgcolor: 'white', 
          border: '1px solid #e0e0e0',
          flex: { xs: '1 1 auto', md: '2 1 0' },
          minWidth: 0
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: '#1a237e', width: 45, height: 45 }}><Speed /></Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">Model Performance</Typography>
                <Typography variant="body2" color="text.secondary">XGBoost Classifier • Real-time</Typography>
              </Box>
            </Box>
            <Chip icon={<CheckCircle />} label="Operational" color="success" sx={{ fontWeight: 600 }} />
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <MetricProgress title="Accuracy" value={metrics.accuracy} target={99} color="#1a237e" icon={Analytics} delay={0.4} />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <MetricProgress title="Precision" value={metrics.precision} target={98} color="#2e7d32" icon={GppGood} delay={0.5} />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <MetricProgress title="Recall" value={metrics.recall} target={95} color="#ef6c00" icon={Timeline} delay={0.6} />
            </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
              <MetricProgress title="F1 Score" value={metrics.f1Score} target={96} color="#1565c0" icon={Assessment} delay={0.7} />
            </Grid>
          </Grid>
        </Paper>

        {/* Recent Activity */}
        <Paper elevation={0} sx={{ 
          p: 3, 
          borderRadius: 3, 
          bgcolor: 'white', 
          border: '1px solid #e0e0e0',
          flex: { xs: '1 1 auto', md: '1 1 0' },
          minWidth: { xs: 'auto', md: 320 },
          maxWidth: { xs: '100%', md: 400 }
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
            <Button size="small" onClick={() => navigate('/history')}>View All</Button>
          </Box>
          {loading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={55} sx={{ mb: 1 }} />)
          ) : recentActivity.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Assessment sx={{ fontSize: 50, color: '#ccc', mb: 1 }} />
              <Typography color="text.secondary" variant="body2">No transactions yet</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate('/analyze')}>Analyze First Transaction</Button>
            </Box>
          ) : (
            recentActivity.map((item, i) => <ActivityItem key={i} {...item} />)
          )}
        </Paper>
      </Box>

      {/* Quick Actions */}
      <Box mt={3} display="flex" gap={2} flexWrap="wrap">
        <Button variant="contained" size="large" startIcon={<Assessment />} onClick={() => navigate('/analyze')} sx={{ background: 'linear-gradient(45deg, #1a237e, #3949ab)', px: 4 }}>
          Analyze Transaction
        </Button>
        <Button variant="outlined" size="large" startIcon={<Timeline />} onClick={() => navigate('/history')} sx={{ borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
          View History
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;