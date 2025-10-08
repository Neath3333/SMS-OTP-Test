#  OTP API

Simple OTP (One-Time Password) API server using PlasGate SMS service.

## Features

 Send OTP via SMS
 
 Verify OTP codes
 
 Auto-expiration (5 minutes)
 
 Rate limiting (1 OTP per minute)
 
 Attempt limiting (3 tries max)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure credentials:**

   Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your PlasGate credentials:
   ```env
   PLASGATE_PRIVATE_KEY=your_private_key_here
   PLASGATE_SECRET=your_secret_key_here
   PLASGATE_SENDER=your_sender_name_here
   PORT=3000
   ```

3. **Start server:**
   ```bash
   npm start
   ```

Server runs on: `http://localhost:3000`

## API Endpoints

### Send OTP

**POST** `/api/send-otp`

**Request:**
```json
{
  "phoneNumber": "85598765432"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully! Check your phone.",
  "expiresAt": "2025-10-07T10:30:00.000Z"
}
```

**Errors:**
- `400` - Invalid phone number format
- `429` - Rate limit exceeded (wait 1 minute)
- `500` - Failed to send SMS

---

### Verify OTP

**POST** `/api/verify-otp`

**Request:**
```json
{
  "phoneNumber": "85598765432",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully!"
}
```

**Errors:**
- `400` - Invalid OTP or too many attempts
- `500` - Server error

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Send OTP
const response = await fetch('http://localhost:3000/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '85598765432' })
});
const data = await response.json();

// Verify OTP
const verifyResponse = await fetch('http://localhost:3000/api/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '85598765432',
    otp: '123456'
  })
});
const verifyData = await verifyResponse.json();
```

### cURL

```bash
# Send OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"85598765432"}'

# Verify OTP
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"85598765432","otp":"123456"}'
```

### Python

```python
import requests

# Send OTP
response = requests.post('http://localhost:3000/api/send-otp',
    json={'phoneNumber': '85598765432'})
print(response.json())

# Verify OTP
verify = requests.post('http://localhost:3000/api/verify-otp',
    json={'phoneNumber': '85598765432', 'otp': '123456'})
print(verify.json())
```

## Configuration

Edit `.env` file to customize:

```env
# API Credentials
PLASGATE_PRIVATE_KEY=your_private_key_here
PLASGATE_SECRET=your_secret_key_here
PLASGATE_SENDER=your_sender_name_here

# Server Configuration
PORT=3000
```

To change OTP settings, edit `server.js`:

```javascript
const CONFIG = {
  otp_expiry_minutes: 5,    // OTP valid for 5 minutes
  max_attempts: 3           // Max 3 verification attempts
};
```

## Phone Number Format

- Must be 11 digits
- Format: `855XXXXXXXX` (Cambodia)
- Example: `85512345678` or `85598765432`


## Files

- `server.js` - Main API server
- `send-otp.js` - OTP utilities (optional, for standalone use)
- `package.json` - Dependencies

## Troubleshooting

**OTP not received:**
- Check sender name is enabled in PlasGate dashboard
- Verify account has sufficient balance
- Check phone number format

**Server won't start:**
- Make sure port 3000 is available
- Run `npm install` first
- Check credentials are correct

## Support

- Express.js: https://expressjs.com/
