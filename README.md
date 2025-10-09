# PlasGate OTP API

Simple OTP (One-Time Password) API server using PlasGate SMS service.

## Features

✅ Send OTP via SMS
✅ Verify OTP codes
✅ Auto-expiration (5 minutes)
✅ Rate limiting (1 OTP per minute)
✅ Attempt limiting (3 tries max)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

### 2. Configure PlasGate Credentials

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your **PlasGate API credentials**:

```env
PLASGATE_PRIVATE_KEY=your_private_key_here
PLASGATE_SECRET=your_secret_key_here
PLASGATE_SENDER=your_sender_name_here
PORT=3000
```

**How to get PlasGate credentials:**
1. Sign up at [https://cloud.plasgate.com/](https://cloud.plasgate.com/)
2. Navigate to API Settings in your dashboard
3. Copy your Private Key and Secret Key
4. Configure your Sender Name (must be approved by PlasGate)

### 3. Start the Server

```bash
npm start
```

Server runs on: `http://localhost:3000`

---

## API Endpoints

### Send OTP

**POST** `/api/send-otp`

Generates a 6-digit OTP and sends it via PlasGate SMS API.

**Request:**
```json
{
  "phoneNumber": "85598765432"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully! Check your phone.",
  "expiresAt": "2025-10-07T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid phone number format (must be 11 digits, start with 855)
- `429` - Rate limit exceeded (wait 1 minute between requests)
- `500` - PlasGate API error or failed to send SMS

---

### Verify OTP

**POST** `/api/verify-otp`

Validates the OTP code entered by the user.

**Request:**
```json
{
  "phoneNumber": "85598765432",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully!"
}
```

**Error Responses:**
- `400` - Invalid/expired OTP or maximum attempts exceeded
- `404` - No OTP found for this phone number
- `500` - Server error

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Send OTP via PlasGate
const sendOTP = async (phoneNumber) => {
  const response = await fetch('http://localhost:3000/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });
  return await response.json();
};

// Verify OTP
const verifyOTP = async (phoneNumber, otp) => {
  const response = await fetch('http://localhost:3000/api/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otp })
  });
  return await response.json();
};

// Example usage
await sendOTP('85598765432');
await verifyOTP('85598765432', '123456');
```

### cURL

```bash
# Send OTP through PlasGate
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

# Send OTP using PlasGate
def send_otp(phone_number):
    response = requests.post('http://localhost:3000/api/send-otp',
        json={'phoneNumber': phone_number})
    return response.json()

# Verify OTP
def verify_otp(phone_number, otp_code):
    response = requests.post('http://localhost:3000/api/verify-otp',
        json={'phoneNumber': phone_number, 'otp': otp_code})
    return response.json()

# Example usage
result = send_otp('85598765432')
print(result)

verify_result = verify_otp('85598765432', '123456')
print(verify_result)
```

---

## Configuration

### Environment Variables

```env
# PlasGate API Credentials
PLASGATE_PRIVATE_KEY=your_private_key_here
PLASGATE_SECRET=your_secret_key_here
PLASGATE_SENDER=your_sender_name_here  # Must be approved in PlasGate dashboard

# Server Configuration
PORT=3000
```

### OTP Settings

Edit `server.js` to customize OTP behavior:

```javascript
const CONFIG = {
  otp_expiry_minutes: 5,    // OTP valid for 5 minutes
  max_attempts: 3,          // Maximum 3 verification attempts
  rate_limit_seconds: 60    // 1 minute cooldown between OTP requests
};
```

---

## Phone Number Format

- Must be 11 digits
- Format: `855XXXXXXXX` (Cambodia)
- Example: `85512345678` or `85598765432`

## Security Notes

⚠️ **IMPORTANT:**
1. ✅ **Never commit `.env` file** to Git (already in `.gitignore`)
2. ✅ **Keep credentials private** - Don't share your API keys
3. ⚠️ **For Production:**
   - Use a real database instead of in-memory storage
   - Add authentication to protect API endpoints
   - Enable HTTPS
   - Add request logging and monitoring
   - Use environment variables in production (Heroku, AWS, etc.)

## Files

- `server.js` - Main API server
- `send-otp.js` - OTP utilities (optional, for standalone use)
- `package.json` - Dependencies

## Troubleshooting

### OTP Not Received

**Possible causes:**
- Check sender name is approved in PlasGate dashboard
- Verify PlasGate account has sufficient SMS balance
- Confirm phone number format is correct (855XXXXXXXX)
- Check PlasGate service status
- Review PlasGate API logs in dashboard

**Solution:**
1. Login to [PlasGate Dashboard](https://cloud.plasgate.com/)
2. Check "SMS History" for delivery status
3. Verify sender name is active
4. Top up account balance if needed

### Server Won't Start

**Possible causes:**
- Port 3000 already in use
- Missing dependencies
- Invalid PlasGate credentials

**Solution:**
```bash
# Check if port is in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Reinstall dependencies
npm install

# Verify .env file exists with correct credentials
cat .env
```

### PlasGate API Errors

**Common error codes:**
- `401 Unauthorized` - Invalid Private Key or Secret
- `402 Payment Required` - Insufficient balance
- `403 Forbidden` - Sender name not approved
- `429 Too Many Requests` - Rate limit exceeded

**Solution:** Check PlasGate documentation or contact support at sales@plasgate.com

---

## Resources

### PlasGate Documentation
- [PlasGate Website](https://plasgate.com/)
- [API Documentation](https://cloud.plasgate.com/)
- [Developer Portal](https://sms.plasgate.com/)
- [Support](https://plasgate.com/services/)

### Framework Documentation
- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [dotenv](https://www.npmjs.com/package/dotenv)

### Related Technologies
- [OTP Best Practices](https://www.twilio.com/docs/glossary/what-is-otp)
- [SMS Security Standards](https://www.gsma.com/)
- [REST API Design](https://restfulapi.net/)

---

## Support

- PlasGate API: https://web.plasgate.com/support/
- Express.js: https://expressjs.com/
