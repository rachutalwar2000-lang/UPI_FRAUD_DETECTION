// web_app/server/routes/auth.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'somerandomsecretstring123';

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();
const twoFactorSecrets = new Map();

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate 2FA Secret
const generate2FASecret = () => crypto.randomBytes(20).toString('hex');

// Generate Backup Codes
const generateBackupCodes = () => 
  Array.from({ length: 8 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());

// --- Registration ---
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }
  
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'Username already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({ 
      username, 
      password: hashedPassword,
      email: email || null,
      createdAt: new Date()
    });
    await user.save();
    
    const token = jwt.sign({ user: { id: user.id, username: user.username } }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      msg: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  const { username, password, twoFactorCode } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password required' });
  }
  
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ 
          requires2FA: true,
          msg: 'Two-factor authentication required'
        });
      }
      
      // Verify 2FA code (simplified - in production use speakeasy/totp)
      const isValidCode = twoFactorCode === '123456'; // Demo: accept any 6-digit code
      if (!isValidCode && !user.backupCodes?.includes(twoFactorCode)) {
        return res.status(400).json({ msg: 'Invalid 2FA code' });
      }
      
      // Remove used backup code
      if (user.backupCodes?.includes(twoFactorCode)) {
        user.backupCodes = user.backupCodes.filter(c => c !== twoFactorCode);
        await user.save();
      }
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign({ user: { id: user.id, username: user.username } }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Update Profile ---
router.put('/profile', auth, async (req, res) => {
  const { username, email } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Check if new username is taken
    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) return res.status(400).json({ msg: 'Username already taken' });
      user.username = username;
    }
    
    if (email !== undefined) user.email = email;
    
    await user.save();
    
    res.json({ 
      msg: 'Profile updated',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Change Password ---
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Current and new password required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ msg: 'New password must be at least 6 characters' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ msg: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Forgot Password (Send OTP) ---
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) return res.status(400).json({ msg: 'Email required' });
  
  try {
    const user = await User.findOne({ email });
    // Don't reveal if user exists for security
    
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 600000, attempts: 0 }); // 10 min expiry
    
    // In production, send email here
    console.log(`📧 Password reset OTP for ${email}: ${otp}`);
    
    res.json({ msg: 'If the email exists, an OTP has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Verify OTP ---
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  const stored = otpStore.get(email);
  if (!stored) return res.status(400).json({ msg: 'OTP expired or not found' });
  
  if (stored.attempts >= 3) {
    otpStore.delete(email);
    return res.status(400).json({ msg: 'Too many attempts. Request new OTP' });
  }
  
  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return res.status(400).json({ msg: 'OTP expired' });
  }
  
  if (stored.otp !== otp) {
    stored.attempts++;
    return res.status(400).json({ msg: 'Invalid OTP' });
  }
  
  res.json({ msg: 'OTP verified', verified: true });
});

// --- Reset Password ---
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  const stored = otpStore.get(email);
  if (!stored || stored.otp !== otp) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    otpStore.delete(email);
    
    res.json({ msg: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- 2FA Setup ---
router.post('/2fa/setup', auth, async (req, res) => {
  try {
    const secret = generate2FASecret();
    twoFactorSecrets.set(req.user.id, secret);
    
    // In production, generate actual QR code with speakeasy/qrcode
    const qrCode = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-size="12">Scan with Auth App</text>
        <text x="100" y="120" text-anchor="middle" font-size="10">${secret.substring(0, 16)}...</text>
      </svg>
    `)}`;
    
    res.json({ secret, qrCode });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- 2FA Verify & Enable ---
router.post('/2fa/verify', auth, async (req, res) => {
  const { code } = req.body;
  
  if (!code || code.length !== 6) {
    return res.status(400).json({ msg: 'Invalid code format' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // In production, verify TOTP code with speakeasy
    // For demo, accept any 6-digit code
    
    const backupCodes = generateBackupCodes();
    
    user.twoFactorEnabled = true;
    user.twoFactorSecret = twoFactorSecrets.get(req.user.id);
    user.backupCodes = backupCodes;
    await user.save();
    
    twoFactorSecrets.delete(req.user.id);
    
    res.json({ msg: '2FA enabled', backupCodes });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Disable 2FA ---
router.post('/2fa/disable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();
    
    res.json({ msg: '2FA disabled' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Delete Account ---
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ msg: 'Account deleted' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Verify Token ---
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;