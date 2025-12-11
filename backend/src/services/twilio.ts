/**
 * Twilio service for sending SMS messages
 */
import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID) {
  console.warn('⚠️  TWILIO_ACCOUNT_SID not set in environment variables');
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  console.warn('⚠️  TWILIO_AUTH_TOKEN not set in environment variables');
}

if (!process.env.TWILIO_PHONE_NUMBER) {
  console.warn('⚠️  TWILIO_PHONE_NUMBER not set in environment variables');
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send an SMS message via Twilio
 * @param phoneNumber - Recipient phone number in +1XXXXXXXXXX format
 * @param message - Message body to send
 * @returns Twilio message SID if successful, null if failed
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<string | null> {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return null;
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`✅ SMS sent to ${phoneNumber}: ${result.sid}`);
    return result.sid;
  } catch (error: any) {
    console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);
    return null;
  }
}

/**
 * Get Twilio client instance (for advanced operations)
 */
export function getTwilioClient() {
  return client;
}

