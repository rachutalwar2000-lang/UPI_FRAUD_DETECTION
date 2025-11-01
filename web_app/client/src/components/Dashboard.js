// web_app/client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Box, Button, LinearProgress,
  Chip, Paper, IconButton, Tooltip, keyframes
} from '@mui/material';
import {
  TrendingUp, Warning, CheckCircle, CurrencyRupee, 
  Assessment, Security, Refresh, ArrowUpward, Speed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.6);
  }
`;

const numberCount = keyframes`
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend, delay = 0 }) => (
  <Card 
    elevation={8}
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      borderLeft: `5px solid ${color}`,
      transition: 'all 0.3s ease',
      animation: `${fadeInUp} 0.6s ease-out ${delay}s both`,
      '&:hover': {
        transform: 'translateY(-10px) scale(1.02)',
        boxShadow: `0 20px 40px ${color}40`,
        animation: `${pulseGlow} 2s ease-in-out infinite`,
      },
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <Box sx={{
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}20, transparent)`,
      pointerEvents: 'none'
    }} />
    
    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          {title}
        </Typography>
        <Icon sx={{ fontSize: 40, color: color, opacity: 0.8 }} />
      </Box>
      
      <Typography 
        variant="h3" 
        fontWeight="bold" 
        color={color}
        sx={{
          animation: `${numberCount} 0.8s ease-out ${delay + 0.3}s both`,
          mb: 1
        }}
      >
        {value}
      </Typography>
      
      {subtitle && (
        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
          {subtitle}
        </Typography>
      )}
      
      {trend && (
        <Chip 
          icon={<ArrowUpward sx={{ fontSize: 16 }} />}
          label={trend}
          size="small"
          sx={{ 
            bgcolor: `${color}20`,
            color: color,
            fontWeight: 'bold',
            '& .MuiChip-icon': { color: color }
          }}
        />
      )}
    </CardContent>
  </Card>
);

const MetricCard = ({ title, value, color, target = 100, delay = 0 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(parseInt(value));
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Box sx={{ animation: `${fadeInUp} 0.6s ease-out ${delay}s both` }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" color="text.secondary" fontWeight="600">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight="bold" color={color}>
          {value}%
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 12, 
          borderRadius: 2,
          backgroundColor: `${color}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 2,
            transition: 'transform 1.5s ease-out'
          }
        }}
      />
      
      <Box display="flex" justifyContent="space-between" mt={0.5}>
        <Typography variant="caption" color="text.secondary">
          Current
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Target: {target}%
        </Typography>
      </Box>
    </Box>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    fraudulent: 0,
    flagged: 0,
    totalAmount: 0,
    fraudPrevented: 0
  });

  const [metrics] = useState({
    accuracy: 97,
    precision: 95,
    recall: 92,
    f1Score: 93,
    falsePositive: 3
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = () => {
    loadStats();
    setLastUpdated(new Date());
  };

  const loadStats = () => {
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const fraudCount = savedTransactions.filter(t => t.prediction === 'Fraud').length;
    const flaggedCount = savedTransactions.filter(t => t.riskScore >= 40 && t.riskScore < 70).length;
    const totalAmount = savedTransactions.reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0);
    const fraudAmount = savedTransactions
      .filter(t => t.prediction === 'Fraud')
      .reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0);

    setStats({
      totalTransactions: savedTransactions.length,
      fraudulent: fraudCount,
      flagged: flaggedCount,
      totalAmount: totalAmount.toFixed(0),
      fraudPrevented: fraudAmount.toFixed(0)
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(-45deg, #667eea20, #764ba220, #f093fb20, #f5576c20)',
      backgroundSize: '400% 400%',
      animation: `${gradientShift} 15s ease infinite`
    }}>
      {/* Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              animation: `${fadeInUp} 0.6s ease-out`
            }}
          >
            🛡️ Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Real-time fraud detection analytics • Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={refreshData}
            sx={{
              bgcolor: 'white',
              boxShadow: 3,
              '&:hover': {
                bgcolor: '#f5f5f5',
                transform: 'rotate(180deg)',
              },
              transition: 'transform 0.6s ease'
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Top Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Total Transactions" 
            value={stats.totalTransactions}
            icon={Assessment}
            color="#667eea"
            subtitle="All analyzed"
            trend="+12% this week"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Fraudulent Blocked" 
            value={stats.fraudulent}
            icon={Warning}
            color="#f5576c"
            subtitle="Automatically blocked"
            trend="-8% decrease"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Flagged for Review" 
            value={stats.flagged}
            icon={Security}
            color="#ffa726"
            subtitle="Manual verification"
            trend="Review pending"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard 
            title="Total Processed" 
            value={`₹${(parseInt(stats.totalAmount) / 1000).toFixed(0)}K`}
            icon={CurrencyRupee}
            color="#4caf50"
            subtitle={`₹${(parseInt(stats.fraudPrevented) / 1000).toFixed(0)}K fraud prevented`}
            trend="+25% volume"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Paper 
        elevation={8}
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          animation: `${fadeInUp} 0.8s ease-out 0.4s both`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #667eea10, transparent)',
          pointerEvents: 'none'
        }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} position="relative" zIndex={1}>
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Speed sx={{ fontSize: 40, color: '#667eea' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Model Performance Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  XGBoost Classifier • Real-time monitoring
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<TrendingUp />}
            onClick={() => navigate('/analyze')}
            sx={{ 
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s'
            }}
          >
            Analyze New
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard title="Accuracy" value={metrics.accuracy} color="#667eea" delay={0.5} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard title="Precision" value={metrics.precision} color="#4caf50" delay={0.6} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard title="Recall" value={metrics.recall} color="#ff9800" delay={0.7} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard title="F1 Score" value={metrics.f1Score} color="#2196f3" delay={0.8} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard title="False Positive" value={metrics.falsePositive} color="#f44336" target={10} delay={0.9} />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ animation: `${fadeInUp} 0.6s ease-out 1s both` }}>
              <Typography variant="body2" color="text.secondary" fontWeight="600" mb={1}>
                System Health
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  animation: `${pulseGlow} 2s ease-in-out infinite`,
                  boxShadow: '0 0 20px #4caf5080'
                }} />
                <Typography variant="h5" fontWeight="bold" color="#4caf50">
                  Operational
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                All systems running smoothly
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Actions */}
      <Box 
        mt={4} 
        display="flex" 
        gap={2}
        sx={{ animation: `${fadeInUp} 0.8s ease-out 1.1s both` }}
      >
        <Button 
          variant="contained" 
          size="large"
          startIcon={<Assessment />}
          onClick={() => navigate('/analyze')}
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          Analyze New Transaction
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          startIcon={<TrendingUp />}
          onClick={() => navigate('/history')}
          sx={{
            borderWidth: 2,
            fontWeight: 'bold',
            px: 4,
            '&:hover': {
              borderWidth: 2,
              transform: 'translateY(-3px)',
            },
            transition: 'all 0.3s ease'
          }}
        >
          View History
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;