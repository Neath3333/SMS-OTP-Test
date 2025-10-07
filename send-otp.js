/**
 * PlasGate OTP (One-Time Password) System
 * Generate and send OTP codes via SMS
 */

const https = require('https');
const crypto = require('crypto');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  private_key: 'YOUR_PRIVATE_KEY_HERE',
  secret: 'YOUR_SECRET_KEY_HERE',
  sender: 'YourSenderName',
  to: '85512345678'
};

// ============================================
// OTP GENERATOR
// ============================================
function generateOTP(length = 6) {
  // Generate cryptographically secure random OTP
  const digits = '0123456789';
  let otp = '';

  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }

  return otp;
}

// ============================================
// SEND OTP FUNCTION
// ============================================
function sendOTP(phoneNumber, otpCode, appName = 'YourApp') {
  // Create OTP message
  const content = `Your ${appName} verification code is: ${otpCode}.Do not share this code with anyone.`;

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

  return new Promise((resolve, reject) => {
    console.log('\n Sending OTP...');
    console.log('='.repeat(50));
    console.log('To:', phoneNumber);
    console.log('OTP Code:', otpCode);
    console.log('Message:', content);
    console.log('='.repeat(50));

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n Response Status:', res.statusCode);
        console.log(' Response Body:', data);

        if (res.statusCode === 200) {
          console.log('\n OTP SENT SUCCESSFULLY!');
          console.log('OTP Code:', otpCode);
          console.log('Expires in: 5 minutes');
          resolve({
            success: true,
            otp: otpCode,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
          });
        } else {
          console.log('\n ERROR sending OTP');
          reject(new Error(`Failed to send OTP: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(' Request Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// ============================================
// OTP STORAGE (In-Memory for demo)
// ============================================
const otpStorage = new Map();

function storeOTP(phoneNumber, otpCode, expiresAt) {
  otpStorage.set(phoneNumber, {
    code: otpCode,
    expiresAt: expiresAt,
    attempts: 0
  });

  // Auto-cleanup after expiration
  setTimeout(() => {
    otpStorage.delete(phoneNumber);
    console.log(`\n  OTP for ${phoneNumber} has expired and been removed`);
  }, 5 * 60 * 1000); // 5 minutes
}

function verifyOTP(phoneNumber, inputCode) {
  const otpData = otpStorage.get(phoneNumber);

  if (!otpData) {
    return { success: false, message: 'OTP not found or expired' };
  }

  if (new Date() > otpData.expiresAt) {
    otpStorage.delete(phoneNumber);
    return { success: false, message: 'OTP has expired' };
  }

  if (otpData.attempts >= 3) {
    otpStorage.delete(phoneNumber);
    return { success: false, message: 'Too many failed attempts' };
  }

  if (otpData.code === inputCode) {
    otpStorage.delete(phoneNumber);
    return { success: true, message: 'OTP verified successfully' };
  } else {
    otpData.attempts++;
    return {
      success: false,
      message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining`
    };
  }
}

// ============================================
// MAIN DEMO
// ============================================
async function demo() {
  try {
    // Generate OTP
    const otpCode = generateOTP(6);

    // Send OTP via SMS
    const result = await sendOTP(CONFIG.to, otpCode, 'PlasGate Demo');

    // Store OTP for verification
    storeOTP(CONFIG.to, otpCode, result.expiresAt);

    console.log('\n' + '='.repeat(50));
    console.log(' OTP stored in memory for verification');
    console.log(' Check your phone for the SMS');
    console.log(' OTP will expire at:', result.expiresAt.toLocaleString());
    console.log('='.repeat(50));

    // Demo: Verify OTP after user input (simulation)
    console.log('\n VERIFICATION DEMO:');
    console.log('='.repeat(50));

    // Simulate correct verification
    const verification = verifyOTP(CONFIG.to, otpCode);
    console.log('Verification Result:', verification);

  } catch (error) {
    console.error('\n Error:', error.message);
  }
}

// Run demo
if (require.main === module) {
  demo();
}

// Export functions for use in other files
module.exports = {
  generateOTP,
  sendOTP,
  storeOTP,
  verifyOTP
};
