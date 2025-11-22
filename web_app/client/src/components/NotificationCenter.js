// web_app/client/src/components/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, Typography, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, IconButton, Badge, Chip, Divider, Button, Tabs, Tab,
  Snackbar, Alert, Slide, keyframes
} from '@mui/material';
import {
  Notifications, Close, Info, Delete, DoneAll, 
  GppBad, GppGood, GppMaybe, NotificationsActive
} from '@mui/icons-material';

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

// Notification Item Component
const NotificationItem = ({ notification, onDismiss, onMarkRead }) => {
  const getConfig = () => {
    switch (notification.type) {
      case 'fraud':
        return { icon: <GppBad />, color: '#c62828', bg: '#ffebee' };
      case 'flagged':
        return { icon: <GppMaybe />, color: '#ef6c00', bg: '#fff3e0' };
      case 'success':
        return { icon: <GppGood />, color: '#2e7d32', bg: '#e8f5e9' };
      case 'info':
        return { icon: <Info />, color: '#1565c0', bg: '#e3f2fd' };
      default:
        return { icon: <Notifications />, color: '#757575', bg: '#f5f5f5' };
    }
  };

  const config = getConfig();

  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : config.bg,
        borderLeft: `4px solid ${config.color}`,
        mb: 1, borderRadius: 1,
        animation: `${slideIn} 0.3s ease-out`,
        '&:hover': { bgcolor: '#f5f5f5' }
      }}
      secondaryAction={
        <IconButton size="small" onClick={() => onDismiss(notification.id)}>
          <Close fontSize="small" />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: config.color }}>{config.icon}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
              {notification.title}
            </Typography>
            {!notification.read && (
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: config.color }} />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {notification.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {notification.time}
            </Typography>
          </Box>
        }
        onClick={() => onMarkRead(notification.id)}
        sx={{ cursor: 'pointer' }}
      />
    </ListItem>
  );
};

// Main Notification Center Component
const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [toast, setToast] = useState(null);
  const [connected, setConnected] = useState(false);

  // Initialize with demo notifications
  useEffect(() => {
    const demoNotifications = [
      {
        id: 1,
        type: 'fraud',
        title: 'Fraud Detected!',
        message: 'Transaction of ₹50,000 has been blocked',
        time: '2 minutes ago',
        read: false,
        timestamp: Date.now() - 120000
      },
      {
        id: 2,
        type: 'flagged',
        title: 'Transaction Flagged',
        message: '₹35,000 P2P transfer requires review',
        time: '5 minutes ago',
        read: false,
        timestamp: Date.now() - 300000
      },
      {
        id: 3,
        type: 'success',
        title: 'Transaction Verified',
        message: '₹2,500 payment processed successfully',
        time: '10 minutes ago',
        read: true,
        timestamp: Date.now() - 600000
      },
      {
        id: 4,
        type: 'info',
        title: 'System Update',
        message: 'Model accuracy improved to 97.5%',
        time: '1 hour ago',
        read: true,
        timestamp: Date.now() - 3600000
      }
    ];
    setNotifications(demoNotifications);
  }, []);

  // Simulate WebSocket connection
  useEffect(() => {
    // In production, this would be actual WebSocket
    const connectWebSocket = () => {
      console.log('🔌 Connecting to notification service...');
      
      // Simulate connection
      setTimeout(() => {
        setConnected(true);
        console.log('✅ Connected to notification service');
      }, 1000);

      // Simulate receiving notifications
      const interval = setInterval(() => {
        const random = Math.random();
        if (random > 0.8) {
          const newNotification = {
            id: Date.now(),
            type: random > 0.9 ? 'fraud' : 'success',
            title: random > 0.9 ? 'Fraud Alert!' : 'Transaction Verified',
            message: random > 0.9 
              ? `Suspicious transaction of ₹${Math.floor(Math.random() * 100000)} blocked`
              : `₹${Math.floor(Math.random() * 10000)} processed successfully`,
            time: 'Just now',
            read: false,
            timestamp: Date.now()
          };

          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for important notifications
          if (newNotification.type === 'fraud') {
            setToast({
              type: 'error',
              message: newNotification.title + ' - ' + newNotification.message
            });
          }
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    if (tabValue === 1) return !n.read;
    if (tabValue === 2) return n.type === 'fraud' || n.type === 'flagged';
    return true;
  });

  return (
    <>
      {/* Notification Bell Button */}
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{
          animation: unreadCount > 0 ? `${pulse} 2s ease-in-out infinite` : 'none'
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {connected ? <NotificationsActive /> : <Notifications />}
        </Badge>
      </IconButton>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        {/* Header */}
        <Box sx={{
          p: 2, background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          color: 'white'
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <Notifications />
              <Typography variant="h6" fontWeight="bold">Notifications</Typography>
              {unreadCount > 0 && (
                <Chip label={unreadCount} size="small" sx={{ bgcolor: '#c62828', color: 'white' }} />
              )}
            </Box>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          {/* Connection Status */}
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              bgcolor: connected ? '#4caf50' : '#f44336'
            }} />
            <Typography variant="caption">
              {connected ? 'Live updates enabled' : 'Connecting...'}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} variant="fullWidth">
          <Tab label="All" />
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="Alerts" />
        </Tabs>

        {/* Actions */}
        <Box display="flex" justifyContent="space-between" p={1} bgcolor="#f5f5f5">
          <Button size="small" startIcon={<DoneAll />} onClick={handleMarkAllRead}>
            Mark all read
          </Button>
          <Button size="small" color="error" startIcon={<Delete />} onClick={handleClearAll}>
            Clear all
          </Button>
        </Box>

        <Divider />

        {/* Notification List */}
        <List sx={{ p: 1, flexGrow: 1, overflow: 'auto' }}>
          {filteredNotifications.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Notifications sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
              <Typography color="text.secondary">No notifications</Typography>
            </Box>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDismiss={handleDismiss}
                onMarkRead={handleMarkRead}
              />
            ))
          )}
        </List>
      </Drawer>

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={6000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        {toast && (
          <Alert
            severity={toast.type}
            onClose={() => setToast(null)}
            sx={{ minWidth: 300 }}
            variant="filled"
          >
            {toast.message}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default NotificationCenter;