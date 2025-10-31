// src/components/Dashboard.js
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';

// A helper component for the statistic cards
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Typography variant="h5" component="div">{value}</Typography>
      <Typography color="text.secondary">{title}</Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <Box>
      {/* Top row of summary cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Transactions" value="8" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Fraudulent" value="2" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Flagged for Review" value="2" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Amount" value="₹13,71,999" /></Grid>
      </Grid>

      {/* Model Performance Section */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Model Performance</Typography>
            <Button variant="outlined" size="small">Recalculate Metrics</Button>
          </Box>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6} md={2}><StatCard title="Accuracy" value="63%" /></Grid>
            <Grid item xs={6} md={2}><StatCard title="Precision" value="100%" /></Grid>
            <Grid item xs={6} md={2}><StatCard title="Recall" value="40%" /></Grid>
            <Grid item xs={6} md={2}><StatCard title="F1 Score" value="57%" /></Grid>
            <Grid item xs={6} md={2}><StatCard title="False Positive" value="0%" /></Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;