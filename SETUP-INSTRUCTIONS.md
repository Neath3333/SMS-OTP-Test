# OTP API - Setup Instructions

## 📋 What This Project Does

This is a complete OTP (One-Time Password) verification API that:
- Sends OTP codes via SMS using PlasGate
- Verifies OTP codes
- Handles rate limiting and expiration
- Works with any frontend (React, Vue, Angular, PHP, etc.)

---

## 🚀 Quick Start

### **Step 1: Install Dependencies**

```bash
npm install
```

### **Step 2: Configure API Credentials**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your PlasGate credentials:
   ```env
   PLASGATE_PRIVATE_KEY=your_private_key_from_plasgate
   PLASGATE_SECRET=your_secret_key_from_plasgate
   PLASGATE_SENDER=your_approved_sender_name
   PORT=3000
   ```

### **Step 3: Start Server**

```bash
npm start
```

Server will run at: **http://localhost:3000**

---

## 🧪 Test the API

### **Option 1: Use Test Page (Browser)**

1. Open: http://localhost:3000/test-otp.html
2. Enter phone number (format: 855XXXXXXXX)
3. Click "Send OTP"
4. Check phone for SMS
5. Enter OTP code
6. Click "Verify OTP"

### **Option 2: Use cURL (Command Line)**

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"85512345678"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"85512345678","otp":"123456"}'
```

---

## 📡 API Endpoints

### **POST /api/send-otp**

Send OTP to phone number.

**Request:**
```json
{
  "phoneNumber": "85512345678"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully! Check your phone.",
  "expiresAt": "2025-10-07T10:30:00.000Z"
}
```

**Error Response (400/429/500):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

### **POST /api/verify-otp**

Verify OTP code.

**Request:**
```json
{
  "phoneNumber": "85512345678",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully!"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}
```

---

## ⚙️ Configuration

### **Environment Variables (.env)**

| Variable | Description | Example |
|----------|-------------|---------|
| PLASGATE_PRIVATE_KEY | Your PlasGate private key | -fH0RCc... |
| PLASGATE_SECRET | Your PlasGate secret key | $5$rounds... |
| PLASGATE_SENDER | Your approved sender name | YourApp |
| PORT | Server port | 3000 |

### **Server Settings (server.js)**

```javascript
const CONFIG = {
  otp_expiry_minutes: 5,    // OTP expires after 5 minutes
  max_attempts: 3           // Max 3 verification attempts
};
```

### **Customize SMS Message**

Edit `server.js` line 55:

```javascript
const content = `Your verification code is: ${otpCode}. Do not share this code with anyone.`;
```

Change to:
```javascript
const content = `Welcome! Your code is: ${otpCode}`;
```

---

## 📱 Phone Number Format

- **Format:** `855XXXXXXXX` (Cambodia)
- **Example:** `85512345678`, `85597654321`
- **Length:** 11 digits (855 + 8-9 digits)

---

## 🔒 Security Features

✅ **Rate limiting:** 1 OTP per minute per phone number
✅ **Expiration:** OTP expires after 5 minutes
✅ **Attempt limiting:** Max 3 verification attempts
✅ **Auto-cleanup:** Expired OTPs automatically deleted
✅ **Validation:** Phone number format validation
✅ **Environment variables:** Credentials not in code

---

## 🧩 Integration Examples

See `README.md` for integration examples with:
- React/Next.js
- Vue.js
- Vanilla JavaScript
- PHP
- Python

---

## 📂 Project Structure

```
sms-test/
├── .env                  # Your credentials (DO NOT SHARE!)
├── .env.example          # Template for credentials
├── .gitignore            # Prevents .env from being committed
├── server.js             # Main API server
├── send-otp.js           # Optional standalone utilities
├── package.json          # Dependencies
├── public/
│   └── test-otp.html     # Test page
└── README.md             # Full documentation
```

---

## 🐛 Troubleshooting

### **Server won't start**
- Run `npm install` first
- Check if port 3000 is available
- Verify `.env` file exists with credentials

### **OTP not received**
- Check sender name is enabled in PlasGate dashboard
- Verify account has sufficient balance
- Check phone number format (855XXXXXXXX)
- Check spam folder

### **"Invalid phone number" error**
- Must be 11 digits
- Must start with 855
- Example: 85512345678

### **"Rate limit exceeded"**
- Wait 60 seconds between requests for same number
- Each phone number can only request OTP once per minute

---

## 📞 Support

- PlasGate API: https://web.plasgate.com/support/
- Express.js Docs: https://expressjs.com/

---

## ✅ Testing Checklist

Before sending to your boss, verify:

- [ ] Server starts successfully (`npm start`)
- [ ] Test page works (http://localhost:3000/test-otp.html)
- [ ] Send OTP works (receives SMS)
- [ ] Verify OTP works (correct code accepted)
- [ ] Wrong OTP rejected (shows error)
- [ ] Rate limit works (wait 1 minute message)
- [ ] `.env` file contains credentials
- [ ] README.md is clear and complete

---

**Ready to use!** 🚀
