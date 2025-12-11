# Testing SMS Functionality

## Quick Test Endpoint

I've added a test endpoint that allows you to send SMS messages directly without going through the full tour setup.

### Method 1: Using curl (Terminal)

```bash
curl -X POST http://localhost:3001/api/sms/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+16181234567",
    "message": "🎅 Test message from Santa Tracker!"
  }'
```

Replace `+16181234567` with your actual phone number.

### Method 2: Using a REST Client (Postman, Insomnia, etc.)

**URL:** `POST http://localhost:3001/api/sms/test`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "phoneNumber": "+16181234567",
  "message": "🎅 Test message from Santa Tracker!"
}
```

### Method 3: Using Browser Console (if frontend is running)

Open browser console on any page and run:

```javascript
fetch('http://localhost:3001/api/sms/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phoneNumber: '+16181234567',
    message: '🎅 Test message from Santa Tracker!'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## Phone Number Format

The phone number can be in any of these formats:
- `+16181234567` (E.164 format - recommended)
- `6181234567` (10 digits - will be auto-formatted)
- `(618) 123-4567` (formatted - will be auto-formatted)

All will be converted to `+16181234567` format.

## Expected Response

**Success:**
```json
{
  "success": true,
  "messageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "phoneNumber": "+16181234567",
  "message": "Test SMS sent successfully!"
}
```

**Error:**
```json
{
  "error": "Invalid phone number format. Use format: +1XXXXXXXXXX or 10 digits"
}
```

## Troubleshooting

### If SMS doesn't send:

1. **Check Twilio credentials in `.env`:**
   ```bash
   # Make sure these are set in backend/.env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+15551234567
   ```

2. **Check backend logs:**
   - Look for error messages in the terminal where you're running `npm run dev`
   - Common errors:
     - "Twilio credentials not configured" - Missing env variables
     - "Invalid phone number" - Wrong format
     - "Failed to send SMS" - Twilio API error (check account credits, phone number permissions)

3. **Verify Twilio account:**
   - Check that your Twilio account has SMS enabled
   - Verify your phone number has SMS capabilities
   - Check account balance/credits

4. **Test with Twilio Console:**
   - Go to Twilio Console > Messaging > Try it out
   - Try sending a test message directly from Twilio
   - This helps isolate if the issue is with Twilio or our code

## Testing the Full Flow

Once the test endpoint works, you can test the full flow:

1. Create a tour
2. Add a family with SMS opt-in enabled
3. Start the tour (should trigger SMS to all families with opt-in)
4. Reply to SMS with "SKIP" to test webhook receiving

