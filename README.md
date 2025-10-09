# PlasGate OTP Testing API

Complete OTP (One-Time Password) verification system demonstration using **PlasGate SMS API** - Cambodia's largest and most trusted SMS gateway service.

---

## About PlasGate

**PlasGate Co., Ltd.** is Cambodia's premier mobile cloud communication gateway and the **only company authorized** by all major telecom operators in the country.

### Why PlasGate?

- **Exclusive Authorization** - Official partner of Smart, Cellcard, Metfone, SeaTel, qb, and CooTel
- **Largest SMS Gateway** - Cambodia's #1 SMS service provider
- **Enterprise Grade** - Trusted by major institutions (ABA Bank, Wing, Canadia Bank)
- **Multi-Channel** - SMS, Voice, and IP communication APIs
- **Security First** - VPN and IP lock security features
- **Easy Integration** - Well-documented API for rapid development

### PlasGate Services

- **SMS API** - One-time passwords, reminders, notifications, marketing campaigns
- **Voice API** - Voice calls and IVR systems
- **IP Communication** - Virtual Private Network (VPN) with security features
- **Enterprise Support** - Dedicated customer service and technical assistance

### Contact PlasGate

- **Website**: [https://plasgate.com/](https://plasgate.com/)
- **Email**: sales@plasgate.com
- **Phone**: +855 69 333 575
- **Portal**: [https://cloud.plasgate.com/](https://cloud.plasgate.com/)

---

## Project Features

This demonstration project showcases PlasGate's SMS API capabilities for OTP authentication:

- **Send OTP via SMS** - Generate and deliver secure 6-digit codes
- **Verify OTP Codes** - Validate user input with secure verification
- **Auto-Expiration** - OTPs expire after 5 minutes for security
- **Rate Limiting** - 1 OTP per phone number per minute
- **Attempt Limiting** - Maximum 3 verification attempts
- **Web Interface** - Simple UI for testing OTP functionality
- **RESTful API** - Clean endpoints for integration

---

## Setup Instructions

### 1. Install Dependencies

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

PlasGate SMS API requires Cambodia phone number format:

- **Length**: 11 digits
- **Format**: `855XXXXXXXX`
- **Country Code**: 855 (Cambodia)
- **Examples**:
  - `85512345678` (Smart)
  - `85598765432` (Cellcard)
  - `85510987654` (Metfone)

**Supported Operators** (via PlasGate authorization):
- Smart
- Cellcard
- Metfone
- SeaTel
- qb
- CooTel

---

## Security & Best Practices

### IMPORTANT Security Notes

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Keep API credentials private** - Don't share PlasGate keys
3. **Rate limiting** - Prevent abuse with request throttling
4. **OTP expiration** - Codes expire after 5 minutes
5. **Attempt limiting** - Max 3 tries to prevent brute force

### Production Recommendations

For production deployment with PlasGate:

1. **Database Integration**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Store OTP history and audit logs

2. **API Authentication**
   - Protect endpoints with JWT or API keys
   - Implement user authentication

3. **HTTPS/SSL**
   - Enable HTTPS for encrypted communication
   - Use SSL certificates (Let's Encrypt)

4. **Monitoring & Logging**
   - Track PlasGate API usage and costs
   - Monitor delivery rates and failures
   - Set up alerts for critical errors

5. **Environment Management**
   - Use proper environment variables (AWS Secrets Manager, Heroku Config)
   - Separate dev/staging/production PlasGate credentials

6. **Backup Providers**
   - Consider fallback SMS providers for redundancy
   - Monitor PlasGate service status

---

## Project Structure

```
sms-test/
├── server.js                 # Main Express API server
├── send-otp.js              # PlasGate OTP utilities
├── public/                  # Web interface
│   └── index.html           # OTP testing UI
├── package.json             # Dependencies
├── .env                     # PlasGate credentials (gitignored)
├── .env.example             # Template for credentials
└── PLASGATE-OTP-TEST.md     # This file
```

---

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

### PlasGate Support
- **Email**: sales@plasgate.com
- **Phone**: +855 69 333 575
- **Facebook**: [PlasGate Co., Ltd.](https://www.facebook.com/plasgate/)

### Technical Support
For issues with this demo project, check:
1. PlasGate API status and credentials
2. Server logs for detailed error messages
3. Network connectivity and firewall settings

---

## License

ISC License - Free to use for testing and learning PlasGate SMS API integration.

---

## Next Steps

Ready to integrate PlasGate into your production app?

1. **Sign up** at [cloud.plasgate.com](https://cloud.plasgate.com/)
2. **Get API credentials** from your dashboard
3. **Test this demo** to understand the workflow
4. **Implement** OTP in your application
5. **Deploy** with production-grade security
6. **Monitor** delivery rates and optimize

**PlasGate** - Cambodia's most reliable SMS gateway for your business needs!
