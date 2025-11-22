// web_app/server/routes/transactions.js

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      prediction,
      riskLevel,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (prediction) {
      query.prediction = prediction;
    }

    if (riskLevel) {
      if (riskLevel === 'high') query.riskScore = { $gte: 70 };
      else if (riskLevel === 'medium') query.riskScore = { $gte: 40, $lt: 70 };
      else if (riskLevel === 'low') query.riskScore = { $lt: 40 };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { senderUpiId: { $regex: search, $options: 'i' } },
        { receiverUpiId: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics for logged-in user
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const stats = await Transaction.getUserStats(req.user.id);
    const timeSeries = await Transaction.getTimeSeriesStats(req.user.id, 30);

    res.json({
      success: true,
      data: {
        overview: stats,
        timeSeries
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// @route   PATCH /api/transactions/:id/review
// @desc    Add review to a transaction (for flagged transactions)
// @access  Private
router.patch('/:id/review', async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'blocked', 'flagged'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        status,
        reviewNotes,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// @route   GET /api/transactions/export/csv
// @desc    Export transactions as CSV
// @access  Private
router.get('/export/csv', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Generate CSV
    const headers = [
      'Transaction ID', 'Amount', 'Type', 'Sender', 'Receiver',
      'Prediction', 'Risk Score', 'Status', 'Date'
    ];

    const rows = transactions.map(t => [
      t.transactionId,
      t.amount,
      t.transactionType,
      t.senderUpiId,
      t.receiverUpiId,
      t.prediction,
      t.riskScore,
      t.status,
      new Date(t.createdAt).toISOString()
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

module.exports = router;