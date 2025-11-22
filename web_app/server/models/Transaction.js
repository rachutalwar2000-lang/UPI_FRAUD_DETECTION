// web_app/server/models/Transaction.js

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Transaction Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  transactionType: {
    type: String,
    enum: ['P2P', 'P2M', 'Business'],
    default: 'P2P'
  },
  senderUpiId: {
    type: String,
    required: [true, 'Sender UPI ID is required'],
    trim: true,
    lowercase: true
  },
  receiverUpiId: {
    type: String,
    required: [true, 'Receiver UPI ID is required'],
    trim: true,
    lowercase: true
  },
  deviceId: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
  // Analysis Results
  prediction: {
    type: String,
    enum: ['Valid', 'Fraud', 'Pending'],
    default: 'Pending'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  
  // ML Model Features (for audit trail)
  mlFeatures: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Status & Actions
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked', 'flagged', 'reviewed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Flags
  isFraud: {
    type: Boolean,
    default: false
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ prediction: 1 });
TransactionSchema.index({ riskScore: 1 });
TransactionSchema.index({ senderUpiId: 1 });
TransactionSchema.index({ receiverUpiId: 1 });
TransactionSchema.index({ createdAt: -1 });

// Virtual for risk level
TransactionSchema.virtual('riskLevel').get(function() {
  if (this.riskScore >= 70) return 'high';
  if (this.riskScore >= 40) return 'medium';
  return 'low';
});

// Pre-save middleware to set flags
TransactionSchema.pre('save', function(next) {
  this.isFraud = this.prediction === 'Fraud';
  this.isFlagged = this.riskScore >= 40 && this.riskScore < 70;
  
  // Auto-set status based on prediction
  if (this.prediction === 'Fraud') {
    this.status = 'blocked';
  } else if (this.isFlagged) {
    this.status = 'flagged';
  } else if (this.prediction === 'Valid') {
    this.status = 'approved';
  }
  
  next();
});

// Static method to get user stats
TransactionSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        fraudCount: {
          $sum: { $cond: [{ $eq: ['$prediction', 'Fraud'] }, 1, 0] }
        },
        validCount: {
          $sum: { $cond: [{ $eq: ['$prediction', 'Valid'] }, 1, 0] }
        },
        flaggedCount: {
          $sum: { $cond: ['$isFlagged', 1, 0] }
        },
        avgRiskScore: { $avg: '$riskScore' },
        fraudAmount: {
          $sum: {
            $cond: [{ $eq: ['$prediction', 'Fraud'] }, '$amount', 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    totalAmount: 0,
    fraudCount: 0,
    validCount: 0,
    flaggedCount: 0,
    avgRiskScore: 0,
    fraudAmount: 0
  };
};

// Static method for time-series stats
TransactionSchema.statics.getTimeSeriesStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        fraudCount: {
          $sum: { $cond: [{ $eq: ['$prediction', 'Fraud'] }, 1, 0] }
        },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Transaction', TransactionSchema);