// web_app/client/src/components/Analytics.js - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, Avatar,
  ToggleButton, ToggleButtonGroup, Chip, Skeleton
} from '@mui/material';
import {
  TrendingUp, Assessment, Security, Timeline, PieChart as PieChartIcon,
  BarChart as BarChartIcon, ShowChart, CalendarMonth
} from '@mui/icons-material';

// Simple Chart Components
const SimpleBarChart = ({ data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 160, pt: 2 }}>
      {data.map((item, index) => (
        <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
          <Box
            sx={{
              height: `${(item.value / maxValue) * 120}px`,
              minHeight: 4,
              bgcolor: item.fill || color,
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.5s ease',
              mx: 'auto',
              width: '85%'
            }}
          />
          <Typography variant="caption" sx={{ fontSize: 9, mt: 0.5, display: 'block' }}>
            {item.name}
          </Typography>
          <Typography variant="caption" fontWeight="bold" sx={{ fontSize: 10 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const SimplePieChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let currentAngle = 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
      <svg width="160" height="160" viewBox="0 0 200 200">
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 100 + 80 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
          const y2 = 100 + 80 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
          const largeArc = angle > 180 ? 1 : 0;

          if (item.value === 0) return null;

          return (
            <path
              key={index}
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="100" cy="100" r="40" fill="white" />
        <text x="100" y="105" textAnchor="middle" fontSize="20" fontWeight="bold">
          {total}
        </text>
      </svg>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" sx={{ fontSize: 11 }}>{item.name}: {item.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const SimpleLineChart = ({ data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * 100,
    y: 100 - (d.value / maxValue) * 80
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Box sx={{ p: 1.5 }}>
      <svg width="100%" height="160" viewBox="0 0 100 120" preserveAspectRatio="none">
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => (
          <Typography key={i} variant="caption" sx={{ fontSize: 9 }}>{d.name}</Typography>
        ))}
      </Box>
    </Box>
  );
};

// Compact Stat Card
const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
          {change && (
            <Chip
              size="small"
              label={change}
              sx={{ 
                mt: 0.5,
                height: 20,
                fontSize: 10,
                bgcolor: change.startsWith('+') ? '#e8f5e9' : '#ffebee', 
                color: change.startsWith('+') ? '#2e7d32' : '#c62828',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}15`, color, width: 36, height: 36 }}>
          <Icon sx={{ fontSize: 20 }} />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({ total: 0, fraud: 0, valid: 0, flagged: 0, avgRisk: 0, totalAmount: 0 });
  const [chartData, setChartData] = useState({
    distribution: [],
    riskBreakdown: [],
    timeSeries: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    setLoading(true);
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    const now = Date.now();
    const ranges = { '24h': 86400000, '7d': 604800000, '30d': 2592000000, '90d': 7776000000 };
    const filtered = transactions.filter(t => 
      now - new Date(t.timestamp).getTime() < ranges[timeRange]
    );

    const fraudTx = filtered.filter(t => t.prediction === 'Fraud');
    const validTx = filtered.filter(t => t.prediction === 'Valid');
    const flaggedTx = filtered.filter(t => t.riskScore >= 40 && t.riskScore < 70);

    setStats({
      total: filtered.length,
      fraud: fraudTx.length,
      valid: validTx.length,
      flagged: flaggedTx.length,
      avgRisk: filtered.length > 0 
        ? (filtered.reduce((sum, t) => sum + t.riskScore, 0) / filtered.length).toFixed(1)
        : 0,
      totalAmount: filtered.reduce((sum, t) => sum + parseFloat(t.details?.amount || 0), 0)
    });

    setChartData({
      distribution: [
        { name: 'Valid', value: validTx.length, color: '#2e7d32' },
        { name: 'Fraud', value: fraudTx.length, color: '#c62828' },
        { name: 'Flagged', value: flaggedTx.length, color: '#ef6c00' }
      ],
      riskBreakdown: [
        { name: '0-20', value: filtered.filter(t => t.riskScore < 20).length, fill: '#4caf50' },
        { name: '20-40', value: filtered.filter(t => t.riskScore >= 20 && t.riskScore < 40).length, fill: '#8bc34a' },
        { name: '40-60', value: filtered.filter(t => t.riskScore >= 40 && t.riskScore < 60).length, fill: '#ffc107' },
        { name: '60-80', value: filtered.filter(t => t.riskScore >= 60 && t.riskScore < 80).length, fill: '#ff9800' },
        { name: '80-100', value: filtered.filter(t => t.riskScore >= 80).length, fill: '#f44336' }
      ],
      timeSeries: generateTimeSeries(filtered, timeRange)
    });

    setTimeout(() => setLoading(false), 300);
  };

  const generateTimeSeries = (transactions, range) => {
    const days = range === '24h' ? 24 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      if (range === '24h') {
        date.setHours(date.getHours() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      const dayTx = transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        if (range === '24h') {
          return txDate.getHours() === date.getHours() && txDate.getDate() === date.getDate();
        }
        return txDate.toDateString() === date.toDateString();
      });

      data.push({
        name: range === '24h' ? `${date.getHours()}:00` : `${date.getDate()}/${date.getMonth() + 1}`,
        value: dayTx.length
      });
    }
    return data;
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={6} sm={4} md={2} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={280} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)', bgcolor: '#f5f7fa' }}>
      {/* Compact Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#1a237e' }}>
            <Assessment sx={{ fontSize: 22 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#1a237e">Analytics</Typography>
            <Typography variant="caption" color="text.secondary">
              Transaction insights and trends
            </Typography>
          </Box>
        </Box>

        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={(e, v) => v && setTimeRange(v)}
          size="small"
        >
          <ToggleButton value="24h">24h</ToggleButton>
          <ToggleButton value="7d">7d</ToggleButton>
          <ToggleButton value="30d">30d</ToggleButton>
          <ToggleButton value="90d">90d</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Compact Stats Cards */}
      <Grid container spacing={1.5} mb={2}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={Assessment} label="Total" value={stats.total} color="#1a237e" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={Security} label="Fraud" value={stats.fraud} change="-8%" color="#c62828" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={TrendingUp} label="Valid" value={stats.valid} change="+12%" color="#2e7d32" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={Timeline} label="Flagged" value={stats.flagged} color="#ef6c00" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={ShowChart} label="Avg Risk" value={`${stats.avgRisk}%`} color="#1565c0" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard icon={BarChartIcon} label="Volume" value={`₹${(stats.totalAmount/1000).toFixed(0)}K`} color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Compact Charts */}
      <Grid container spacing={2}>
        {/* Transaction Trends */}
        <Grid item xs={12} lg={7.5}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: 14 }}>
              <Timeline sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
              Transaction Trends
            </Typography>
            {stats.total === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography color="text.secondary" variant="body2">No data available</Typography>
              </Box>
            ) : (
              <SimpleLineChart data={chartData.timeSeries} color="#1a237e" />
            )}
          </Paper>
        </Grid>

        {/* Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: 14 }}>
              <PieChartIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
              Distribution
            </Typography>
            {stats.total === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography color="text.secondary" variant="body2">No data</Typography>
              </Box>
            ) : (
              <SimplePieChart data={chartData.distribution} />
            )}
          </Paper>
        </Grid>

        {/* Risk Score Breakdown */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: 14 }}>
              <BarChartIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
              Risk Score Distribution
            </Typography>
            {stats.total === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography color="text.secondary" variant="body2">No data</Typography>
              </Box>
            ) : (
              <SimpleBarChart data={chartData.riskBreakdown} color="#1a237e" />
            )}
          </Paper>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: 14 }}>
              <CalendarMonth sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
              Period Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                      {stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(0) : 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Success Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="#c62828">
                      {stats.total > 0 ? ((stats.fraud / stats.total) * 100).toFixed(0) : 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Fraud Rate</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" color="#1565c0">
                      ₹{(stats.totalAmount / 1000).toFixed(1)}K
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Total Volume</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;