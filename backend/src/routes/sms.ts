/**
 * SMS webhook routes for receiving messages from Twilio
 */
import express from 'express';
import { handleSMSResponse } from '../services/smsService';
import { formatPhoneNumber, validatePhoneNumber } from '../services/phoneValidation';
import { sendSMS } from '../services/twilio';

const router = express.Router();

// Twilio webhook expects form-urlencoded data, not JSON
router.use(express.urlencoded({ extended: true }));

/**
 * POST /api/sms/test
 * Test endpoint to send a test SMS message
 * Useful for debugging Twilio configuration
 */
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone || !validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format. Use format: +1XXXXXXXXXX or 10 digits' 
      });
    }

    const testMessage = message || '🎅 Test message from Santa Tracker! This is a test SMS to verify Twilio is working correctly.';

    console.log(`📱 Sending test SMS to ${formattedPhone}...`);
    const messageSid = await sendSMS(formattedPhone, testMessage);

    if (messageSid) {
      res.json({ 
        success: true, 
        messageSid,
        phoneNumber: formattedPhone,
        message: 'Test SMS sent successfully!'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send SMS. Check Twilio credentials and configuration.' 
      });
    }
  } catch (error: any) {
    console.error('Test SMS error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send test SMS' 
    });
  }
});

/**
 * POST /api/sms/webhook
 * Twilio webhook endpoint for incoming SMS messages
 */
router.post('/webhook', async (req, res) => {
  try {
    // Twilio sends form-urlencoded data
    const from = req.body.From;
    const body = req.body.Body;

    if (!from || !body) {
      console.error('Missing From or Body in Twilio webhook');
      return res.status(400).send('Missing required fields');
    }

    // Format phone number to ensure +1 prefix
    const phoneNumber = formatPhoneNumber(from);
    if (!phoneNumber) {
      console.error(`Invalid phone number format: ${from}`);
      return res.status(400).send('Invalid phone number format');
    }

    console.log(`📨 Received SMS from ${phoneNumber}: ${body}`);

    // Handle the SMS response
    const updatedVisit = await handleSMSResponse(phoneNumber, body);

    // Emit socket event if visit was updated
    const io = req.app.get('io');
    if (io && updatedVisit) {
      io.to(`tour-${updatedVisit.tourId}`).emit('visit-skipped', {
        visit: updatedVisit,
        tourId: updatedVisit.tourId,
      });
    }

    // Twilio expects a TwiML response
    // We'll send a simple acknowledgment
    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error: any) {
    console.error('Error processing SMS webhook:', error);
    res.type('text/xml');
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

/**
 * POST /api/sms/status
 * Twilio webhook endpoint for delivery status updates (optional)
 */
router.post('/status', async (req, res) => {
  try {
    const messageSid = req.body.MessageSid;
    const status = req.body.MessageStatus;

    console.log(`📊 SMS status update: ${messageSid} - ${status}`);

    // You can store delivery status in database if needed
    // For now, we'll just log it

    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error: any) {
    console.error('Error processing SMS status webhook:', error);
    res.type('text/xml');
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }
});

export default router;

