/**
 * OTP Web Server
 * Complete backend for OTP verification system
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  private_key: process.env.PLASGATE_PRIVATE_KEY || 'YOUR_PRIVATE_KEY_HERE',
  secret: process.env.PLASGATE_SECRET || 'YOUR_SECRET_KEY_HERE',
  sender: process.env.PLASGATE_SENDER || 'YourSenderName',
  otp_expiry_minutes: 5,
  max_attempts: 3
};

// ============================================
// IN-MEMORY STORAGE
// ============================================
const otpStorage = new Map();
const rateLimits = new Map();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate OTP
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

// Send SMS via PlasGate API
function sendSMS(phoneNumber, otpCode) {
  return new Promise((resolve, reject) => {
    const content = `Your verification code is: ${otpCode}. Do not share this code with anyone.`;

    const postData = JSON.stringify({
      sender: CONFIG.sender,
      to: phoneNumber,
      content: content
    });

    const options = {
      hostname: 'cloudapi.plasgate.com',
      port: 443,
      path: `/rest/send?private_key=${CONFIG.private_key}`,
      method: 'POST',
      headers: {
        'X-Secret': CONFIG.secret,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`[${new Date().toISOString()}] Sending OTP to ${phoneNumber}`);

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`[${new Date().toISOString()}] PlasGate Response:`);
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Body: "${data}"`);
        console.log(`  Body Length: ${data.length}`);

        // Accept both 200 and 201, and also accept 202 (Accepted)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[${new Date().toISOString()}] OTP sent successfully to ${phoneNumber}`);
          resolve({ success: true });
        } else {
          console.error(`[${new Date().toISOString()}] Failed to send OTP to ${phoneNumber}`);

          let errorMessage = 'Failed to send SMS';

          // Try to parse error from response
          if (data && data.trim().length > 0) {
            try {
              const errorData = JSON.parse(data);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
              // Not JSON, use raw data
              errorMessage = data.substring(0, 100); // Limit error message length
            }
          }

          reject(new Error(errorMessage));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Error sending OTP to ${phoneNumber}:`, error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Check rate limit
function checkRateLimit(phoneNumber) {
  const lastSent = rateLimits.get(phoneNumber);
  const now = Date.now();

  if (lastSent && now - lastSent < 60000) { // 1 minute
    const waitTime = Math.ceil((60000 - (now - lastSent)) / 1000);
    return { allowed: false, waitTime };
  }

  return { allowed: true };
}

// Store OTP
function storeOTP(phoneNumber, otpCode) {
  const expiresAt = new Date(Date.now() + CONFIG.otp_expiry_minutes * 60 * 1000);

  otpStorage.set(phoneNumber, {
    code: otpCode,
    expiresAt: expiresAt,
    attempts: 0
  });

  // Auto-cleanup
  setTimeout(() => {
    if (otpStorage.has(phoneNumber)) {
      console.log(`[${new Date().toISOString()}] OTP expired for ${phoneNumber}`);
      otpStorage.delete(phoneNumber);
    }
  }, CONFIG.otp_expiry_minutes * 60 * 1000);

  return expiresAt;
}

// Verify OTP
function verifyOTP(phoneNumber, inputCode) {
  const otpData = otpStorage.get(phoneNumber);

  if (!otpData) {
    return { success: false, message: 'OTP not found or expired' };
  }

  if (new Date() > otpData.expiresAt) {
    otpStorage.delete(phoneNumber);
    return { success: false, message: 'OTP has expired' };
  }

  if (otpData.attempts >= CONFIG.max_attempts) {
    otpStorage.delete(phoneNumber);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  if (otpData.code === inputCode) {
    otpStorage.delete(phoneNumber);
    console.log(`[${new Date().toISOString()}] OTP verified successfully for ${phoneNumber}`);
    return { success: true, message: 'OTP verified successfully!' };
  } else {
    otpData.attempts++;
    const remainingAttempts = CONFIG.max_attempts - otpData.attempts;
    return {
      success: false,
      message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
    };
  }
}

// ============================================
// API ROUTES
// ============================================

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log(`[${new Date().toISOString()}] Received /api/send-otp request`);
  console.log('Request body:', req.body);

  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || !phoneNumber.match(/^855\d{8,9}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be in format: 855XXXXXXXX'
      });
    }

    // Check rate limit
    const rateCheck = checkRateLimit(phoneNumber);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${rateCheck.waitTime} seconds before requesting another OTP`
      });
    }

    // Generate OTP
    const otpCode = generateOTP(6);

    // Send SMS
    await sendSMS(phoneNumber, otpCode);

    // Store OTP
    const expiresAt = storeOTP(phoneNumber, otpCode);

    // Update rate limit
    rateLimits.set(phoneNumber, Date.now());

    const response = {
      success: true,
      message: 'OTP sent successfully! Check your phone.',
      expiresAt: expiresAt
    };

    console.log(`[${new Date().toISOString()}] Sending response:`, response);
    console.log('='.repeat(60) + '\n');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /api/send-otp:`, error);

    // Ensure we always send JSON
    if (!res.headersSent) {
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.'
      };

      console.log(`[${new Date().toISOString()}] Sending error response:`, errorResponse);
      console.log('='.repeat(60) + '\n');

      res.setHeader('Content-Type', 'application/json');
      res.status(500).json(errorResponse);
    }
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Verify OTP
    const result = verifyOTP(phoneNumber, otp);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);

    // Ensure we always send JSON
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify OTP. Please try again.'
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  console.log('[TEST] Received request:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working!',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('OTP Server Started!');
  console.log('='.repeat(60));
  console.log(`Open your browser: http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api`);
  console.log(` Configuration:`);
  console.log(`   - OTP Length: 6 digits`);
  console.log(`   - Expiry Time: ${CONFIG.otp_expiry_minutes} minutes`);
  console.log(`   - Max Attempts: ${CONFIG.max_attempts}`);
  console.log(`   - Rate Limit: 1 OTP per minute`);
  console.log(`   - Sender: ${CONFIG.sender}`);
  console.log('='.repeat(60));
  console.log('Press Ctrl+C to stop the server\n');
});
