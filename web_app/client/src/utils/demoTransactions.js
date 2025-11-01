// web_app/client/src/utils/demoTransactions.js

// Sample UPI IDs for testing
export const DEMO_UPI_IDS = {
  // Valid/Safe UPIs
  valid: [
    'john.doe@paytm',
    'sarah.kumar@googlepay',
    'rajesh.sharma@phonepe',
    'priya.patel@paytm',
    'amit.singh@upi',
    'neha.reddy@okaxis',
    'vikram.mehta@icici',
    'anjali.gupta@hdfcbank'
  ],
  
  // Merchant UPIs
  merchants: [
    'amazon.india@icici',
    'flipkart.payments@axis',
    'swiggy.merchant@paytm',
    'zomato.orders@hdfcbank',
    'myntra.shop@paytm',
    'bigbasket.store@icici',
    'bookmyshow.tickets@upi',
    'uber.india@paytm'
  ],
  
  // Suspicious/Fraud UPIs
  suspicious: [
    'fake.account@paytm',
    'scam.user@upi',
    'fraud.merchant@phonepe',
    'suspicious.activity@googlepay',
    'test.scammer@paytm',
    'phishing.link@upi'
  ]
};

// Sample transactions for different scenarios
export const DEMO_TRANSACTIONS = {
  // ✅ VALID/SAFE TRANSACTIONS
  valid: [
    {
      amount: '500',
      transactionType: 'P2P',
      senderUpiId: 'john.doe@paytm',
      receiverUpiId: 'sarah.kumar@googlepay',
      deviceId: 'DEVICE-12345',
      location: 'Mumbai, Maharashtra',
      description: 'Small P2P transfer'
    },
    {
      amount: '2500',
      transactionType: 'P2M',
      senderUpiId: 'rajesh.sharma@phonepe',
      receiverUpiId: 'swiggy.merchant@paytm',
      deviceId: 'DEVICE-67890',
      location: 'Bangalore, Karnataka',
      description: 'Food order payment'
    },
    {
      amount: '15000',
      transactionType: 'P2M',
      senderUpiId: 'priya.patel@paytm',
      receiverUpiId: 'amazon.india@icici',
      deviceId: 'DEVICE-11223',
      location: 'Delhi, Delhi',
      description: 'Online shopping'
    },
    {
      amount: '8500',
      transactionType: 'P2P',
      senderUpiId: 'amit.singh@upi',
      receiverUpiId: 'neha.reddy@okaxis',
      deviceId: 'DEVICE-44556',
      location: 'Pune, Maharashtra',
      description: 'Friend payment'
    }
  ],

  // ⚠️ FLAGGED TRANSACTIONS (Medium Risk)
  flagged: [
    {
      amount: '45000',
      transactionType: 'P2P',
      senderUpiId: 'vikram.mehta@icici',
      receiverUpiId: 'unknown.user@paytm',
      deviceId: 'DEVICE-99887',
      location: 'Jaipur, Rajasthan',
      description: 'Large P2P - needs review'
    },
    {
      amount: '65000',
      transactionType: 'P2P',
      senderUpiId: 'anjali.gupta@hdfcbank',
      receiverUpiId: 'newuser.123@phonepe',
      deviceId: 'DEVICE-77665',
      location: 'Chennai, Tamil Nadu',
      description: 'Unusual amount for P2P'
    },
    {
      amount: '55000',
      transactionType: 'Business',
      senderUpiId: 'business.owner@icici',
      receiverUpiId: 'supplier.xyz@paytm',
      deviceId: 'DEVICE-55443',
      location: 'Hyderabad, Telangana',
      description: 'Business payment - verify'
    }
  ],

  // 🚨 FRAUDULENT TRANSACTIONS
  fraud: [
    {
      amount: '150000',
      transactionType: 'P2P',
      senderUpiId: 'john.doe@paytm',
      receiverUpiId: 'fake.account@paytm',
      deviceId: 'DEVICE-00001',
      location: 'Unknown Location',
      description: 'Very large amount to suspicious account'
    },
    {
      amount: '200000',
      transactionType: 'P2M',
      senderUpiId: 'priya.patel@googlepay',
      receiverUpiId: 'scam.user@upi',
      deviceId: 'DEVICE-00002',
      location: 'International',
      description: 'Scam merchant detection'
    },
    {
      amount: '75000',
      transactionType: 'P2P',
      senderUpiId: 'victim.user@phonepe',
      receiverUpiId: 'fraud.merchant@phonepe',
      deviceId: 'DEVICE-00003',
      location: 'Unknown',
      description: 'Fraud pattern detected'
    },
    {
      amount: '120000',
      transactionType: 'P2P',
      senderUpiId: 'elderly.user@paytm',
      receiverUpiId: 'suspicious.activity@googlepay',
      deviceId: 'DEVICE-00004',
      location: 'Suspicious Location',
      description: 'Phishing attack pattern'
    }
  ]
};

// Function to load a demo transaction into the form
export const loadDemoTransaction = (type = 'valid', index = 0) => {
  const transactions = DEMO_TRANSACTIONS[type];
  if (transactions && transactions[index]) {
    return transactions[index];
  }
  return DEMO_TRANSACTIONS.valid[0];
};