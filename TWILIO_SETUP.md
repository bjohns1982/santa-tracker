# Twilio SMS Setup Guide

This guide will help you configure Twilio for SMS messaging in the Santa Tracker application.

## Prerequisites

1. A Twilio account (you mentioned you already have one)
2. A Twilio phone number with SMS capabilities enabled
3. ngrok installed (for local development webhook testing)

## Step 1: Enable SMS on Your Twilio Phone Number

1. Log in to your Twilio Console: https://console.twilio.com
2. Navigate to **Phone Numbers** > **Manage** > **Active Numbers**
3. Click on your phone number
4. Under **Messaging**, ensure **SMS** is enabled
5. If not enabled, click **Enable** and follow the prompts

## Step 1.5: Register A2P Campaign (REQUIRED for US SMS)

**Important:** As of 2023, Twilio requires A2P (Application-to-Person) campaign registration for all US SMS messaging. This is a compliance requirement from carriers.

1. In Twilio Console, go to **Messaging** > **Regulatory Compliance** > **US A2P Campaigns**
2. Click **Create Campaign** or **Register Campaign**
3. Fill out the campaign details:
   - **Campaign Use Case:** Select "Sole Proprietor" (or appropriate option)
   - **Description:** "The campaign notifies neighbors participating in the annual neighborhood Santa tour."
   - **Sending messages with embedded links?** Yes (since we include the tracker URL)
   - **Sending messages with embedded phone numbers?** No
   - **Sending messages with age-gated content?** No
   - **Sending messages with content related to direct lending?** No
4. Add your message samples (the two templates we use)
5. Submit for review

**Review Timeline:** Campaign registration typically takes 2-3 weeks. Twilio will email you if there are any issues.

**During Review:** You will NOT be able to send SMS messages until the campaign is approved. The campaign status will show "In progress" during this time.

**After Approval:** Once approved, you'll be able to send SMS messages normally. The campaign status will change to "Approved" or "Active".

## Step 2: Get Your Twilio Credentials

1. In the Twilio Console, go to **Account** > **API Keys & Tokens**
2. Note down:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "Show" to reveal)
   - Your **Phone Number** (in E.164 format, e.g., `+15551234567`)

## Step 3: Configure Environment Variables

Add these to your `backend/.env` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
FRONTEND_URL=http://localhost:5173
```

## Step 4: Set Up ngrok for Local Development

1. Install ngrok if you haven't already:

   ```bash
   # macOS
   brew install ngrok

   # Or download from https://ngrok.com/download
   ```

2. Start your backend server:

   ```bash
   cd backend
   npm run dev
   ```

3. In a new terminal, start ngrok:

   ```bash
   ngrok http 3001
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

## Step 5: Configure Twilio Messaging Service Webhook

1. In Twilio Console, go to **Messaging** > **Services**
2. Click on your Messaging Service (or create one if needed)
3. Go to **Integration** tab
4. Under **Incoming Messages**:
   - Select **"Send a webhook"**
   - Enter your webhook URL: `https://your-ngrok-url.ngrok.io/api/sms/webhook`
   - Method: **POST**
5. (Optional) Under **Delivery Status Callback**:
   - Enter: `https://your-ngrok-url.ngrok.io/api/sms/status`
   - This tracks message delivery status
6. Click **Save**

## Step 6: Test the Integration

**⚠️ Important:** You cannot test SMS sending until your A2P campaign is approved (Step 1.5). The campaign review typically takes 2-3 weeks.

### Testing Options:

**Option A: Wait for Campaign Approval (Recommended)**

- Once your A2P campaign is approved, you can test normally
- Use the test endpoint: `POST /api/sms/test` (see TEST_SMS.md)
- Or test through the full tour flow

**Option B: Use Twilio Test Credentials (Limited Testing)**

- Twilio provides test credentials that don't require campaign approval
- These are for development/testing only and have limitations
- See: https://www.twilio.com/docs/iam/test-credentials

**Option C: Test with International Numbers (If Available)**

- A2P registration is only required for US numbers
- If you have access to international numbers, you can test with those

### Once Campaign is Approved:

1. Start your backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start ngrok (if not already running):

   ```bash
   ngrok http 3001
   ```

3. Update the webhook URL in Twilio if your ngrok URL changed

4. Test by:
   - Using the test endpoint: `POST /api/sms/test` (see TEST_SMS.md)
   - Creating a tour
   - Adding a family with SMS opt-in enabled
   - Starting the tour (SMS should be sent automatically)
   - Sending a test SMS to your Twilio number with "SKIP" (should mark visit as skipped)

## Production Setup

For production deployment:

1. Replace ngrok URL with your production backend URL:

   - Example: `https://api.yourdomain.com/api/sms/webhook`

2. Update `TWILIO_WEBHOOK_URL` in your production environment variables

3. Update the webhook URL in Twilio Console to point to your production URL

## Troubleshooting

### SMS Not Sending

**Most Common Issue: A2P Campaign Not Approved**

- If you see errors like "Campaign not registered" or "A2P compliance required"
- Check your campaign status in Twilio Console
- Campaign must show "Approved" or "Active" status (not "In progress")
- Wait for campaign approval (2-3 weeks) before testing

**Other Issues:**

- Check that `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set correctly
- Verify your Twilio account has sufficient credits
- Check backend logs for error messages
- Ensure your phone number has SMS capabilities enabled

### Webhook Not Receiving Messages

- Ensure ngrok is running and the URL is correct
- Verify the webhook URL in Twilio Console matches your ngrok URL
- Check that your backend server is running on port 3001
- Check backend logs for incoming webhook requests

### Phone Number Format Issues

- Phone numbers must be in E.164 format: `+1XXXXXXXXXX`
- The app automatically formats user input, but ensure the stored format is correct

## Message Templates

The app uses two message templates:

1. **Tour Start Message**: Sent to all families with SMS opt-in when tour starts

   - Includes tour name and link to tracking page

2. **On-Deck Message**: Sent when a family is next in line
   - Includes estimated arrival time
   - Provides instructions for responding (SKIP, NOT HOME, CANCEL)

## Response Keywords

Families can respond to SMS with:

- **SKIP**: Marks visit as skipped
- **NOT HOME**: Marks visit as skipped
- **CANCEL**: Marks visit as skipped

All three keywords result in the same action (skipping the visit).
