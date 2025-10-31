// web_app/client/src/components/ResultModal.js
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

const ResultModal = ({ open, handleClose, result }) => {
  const isFraud = result === 'Fraud';

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h4" component="h2" color={isFraud ? 'error' : 'success.main'}>
          {isFraud ? 'Fraud Transaction!' : 'Valid Transaction'}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          This transaction has been classified as {result}.
        </Typography>
        <Button onClick={handleClose} sx={{ mt: 3 }} variant="contained">
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ResultModal;