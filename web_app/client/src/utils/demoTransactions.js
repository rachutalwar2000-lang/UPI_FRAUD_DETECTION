// web_app/client/src/utils/demoTransactions.js

// Sample transactions for different scenarios
export const DEMO_TRANSACTIONS = {
  // ✅ VALID/SAFE TRANSACTIONS (Low risk - will pass as valid)
  valid: [
    {
      amount: '500',
      transactionType: 'P2P',
      senderUpiId: 'john.doe@paytm',
      receiverUpiId: 'sarah.kumar@googlepay',
      deviceId: 'DEVICE-12345',
      location: 'Mumbai, Maharashtra',
    },
    {
      amount: '2500',
      transactionType: 'P2M',
      senderUpiId: 'rajesh.sharma@phonepe',
      receiverUpiId: 'swiggy.merchant@paytm',
      deviceId: 'DEVICE-67890',
      location: 'Bangalore, Karnataka',
    },
    {
      amount: '1500',
      transactionType: 'P2M',
      senderUpiId: 'priya.patel@paytm',
      receiverUpiId: 'amazon.india@icici',
      deviceId: 'DEVICE-11223',
      location: 'Delhi, Delhi',
    },
    {
      amount: '850',
      transactionType: 'P2P',
      senderUpiId: 'amit.singh@upi',
      receiverUpiId: 'neha.reddy@okaxis',
      deviceId: 'DEVICE-44556',
      location: 'Pune, Maharashtra',
    },
    {
      amount: '3200',
      transactionType: 'P2M',
      senderUpiId: 'vikram.mehta@icici',
      receiverUpiId: 'flipkart.payments@axis',
      deviceId: 'DEVICE-78901',
      location: 'Chennai, Tamil Nadu',
    }
  ],

  // ⚠️ FLAGGED TRANSACTIONS (Medium Risk - needs review)
  flagged: [
    {
      amount: '45000',
      transactionType: 'P2P',
      senderUpiId: 'vikram.mehta@icici',
      receiverUpiId: 'unknown.user@paytm',
      deviceId: 'DEVICE-99887',
      location: 'Jaipur, Rajasthan',
    },
    {
      amount: '65000',
      transactionType: 'P2P',
      senderUpiId: 'anjali.gupta@hdfcbank',
      receiverUpiId: 'newuser.123@phonepe',
      deviceId: 'DEVICE-77665',
      location: 'Chennai, Tamil Nadu',
    },
    {
      amount: '55000',
      transactionType: 'Business',
      senderUpiId: 'business.owner@icici',
      receiverUpiId: 'supplier.xyz@paytm',
      deviceId: 'DEVICE-55443',
      location: 'Hyderabad, Telangana',
    },
    {
      amount: '38000',
      transactionType: 'P2P',
      senderUpiId: 'student.user@paytm',
      receiverUpiId: 'tuition.fees@upi',
      deviceId: 'DEVICE-33221',
      location: 'Kolkata, West Bengal',
    }
  ],

  // 🚨 FRAUDULENT TRANSACTIONS (High Risk - will be blocked)
  fraud: [
    {
      amount: '150000',
      transactionType: 'P2P',
      senderUpiId: 'john.doe@paytm',
      receiverUpiId: 'fake.account@paytm',
      deviceId: 'DEVICE-00001',
      location: 'Unknown Location',
    },
    {
      amount: '200000',
      transactionType: 'P2M',
      senderUpiId: 'priya.patel@googlepay',
      receiverUpiId: 'scam.merchant@upi',
      deviceId: 'DEVICE-00002',
      location: 'International',
    },
    {
      amount: '175000',
      transactionType: 'P2P',
      senderUpiId: 'victim.user@phonepe',
      receiverUpiId: 'fraud.alert@phonepe',
      deviceId: 'DEVICE-00003',
      location: 'Unknown',
    },
    {
      amount: '120000',
      transactionType: 'P2P',
      senderUpiId: 'elderly.user@paytm',
      receiverUpiId: 'suspicious.transfer@googlepay',
      deviceId: 'DEVICE-00004',
      location: 'Suspicious Location',
    },
    {
      amount: '250000',
      transactionType: 'Business',
      senderUpiId: 'company.account@icici',
      receiverUpiId: 'fake.supplier@upi',
      deviceId: 'DEVICE-00005',
      location: 'VPN Detected',
    }
  ]
};

// Function to load a demo transaction into the form
export const loadDemoTransaction = (type = 'valid', index = 0) => {
  const transactions = DEMO_TRANSACTIONS[type];
  if (transactions && transactions[index]) {
    return { ...transactions[index] };
  }
  return { ...DEMO_TRANSACTIONS.valid[0] };
};

// Get random demo transaction
export const getRandomDemo = (type) => {
  const transactions = DEMO_TRANSACTIONS[type];
  const randomIndex = Math.floor(Math.random() * transactions.length);
  return { ...transactions[randomIndex] };
};