/**
 * SMS service for sending tour-related messages
 */
import prisma from '../lib/prisma';
import { sendSMS } from './twilio';
import { tourStartMessage, onDeckMessage } from './smsTemplates';
import { validatePhoneNumber } from './phoneValidation';

/**
 * Send tour start messages to all families with SMS opt-in
 * @param tourId - Tour ID
 * @returns Number of messages sent successfully
 */
export async function sendTourStartMessages(tourId: string): Promise<number> {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        families: {
          where: {
            smsOptIn: true,
            OR: [
              { phoneNumber1: { not: null } },
              { phoneNumber2: { not: null } },
            ],
          },
        },
      },
    });

    if (!tour) {
      console.error(`Tour ${tourId} not found`);
      return 0;
    }

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let sentCount = 0;

    for (const family of tour.families) {
      const message = tourStartMessage(tour.name, tour.inviteCode, appUrl);

      // Send to primary phone number
      if (family.phoneNumber1 && validatePhoneNumber(family.phoneNumber1)) {
        const result = await sendSMS(family.phoneNumber1, message);
        if (result) sentCount++;
      }

      // Send to secondary phone number if provided
      if (family.phoneNumber2 && validatePhoneNumber(family.phoneNumber2)) {
        const result = await sendSMS(family.phoneNumber2, message);
        if (result) sentCount++;
      }
    }

    console.log(`📱 Sent ${sentCount} tour start SMS messages for tour ${tourId}`);
    return sentCount;
  } catch (error: any) {
    console.error('Error sending tour start messages:', error);
    return 0;
  }
}

/**
 * Send "on deck" message when family is next in line
 * @param familyId - Family ID
 * @param estimatedMinutes - Estimated minutes until arrival (default: 5 minutes per visit)
 * @returns true if sent successfully, false otherwise
 */
export async function sendOnDeckMessage(familyId: string, estimatedMinutes: number = 5): Promise<boolean> {
  try {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family || !family.smsOptIn) {
      return false;
    }

    const message = onDeckMessage(family.familyName, estimatedMinutes);
    let sent = false;

    // Send to primary phone number
    if (family.phoneNumber1 && validatePhoneNumber(family.phoneNumber1)) {
      const result = await sendSMS(family.phoneNumber1, message);
      if (result) sent = true;
    }

    // Send to secondary phone number if provided
    if (family.phoneNumber2 && validatePhoneNumber(family.phoneNumber2)) {
      const result = await sendSMS(family.phoneNumber2, message);
      if (result) sent = true;
    }

    if (sent) {
      console.log(`📱 Sent on-deck message to family ${familyId}`);
    }

    return sent;
  } catch (error: any) {
    console.error('Error sending on-deck message:', error);
    return false;
  }
}

/**
 * Parse SMS response for keywords
 * @param message - Incoming SMS message
 * @returns Parsed response type or null
 */
export function parseSMSResponse(message: string): 'SKIP' | 'NOT_HOME' | 'CANCEL' | null {
  if (!message) return null;

  const upperMessage = message.toUpperCase().trim();

  // Check for keywords
  if (upperMessage.includes('SKIP')) {
    return 'SKIP';
  }
  if (upperMessage.includes('NOT HOME') || upperMessage.includes('NOTHOME')) {
    return 'NOT_HOME';
  }
  if (upperMessage.includes('CANCEL')) {
    return 'CANCEL';
  }

  return null;
}

/**
 * Handle incoming SMS response
 * @param phoneNumber - Phone number that sent the message
 * @param message - Message body
 * @returns Updated visit if found and processed, null otherwise
 */
export async function handleSMSResponse(phoneNumber: string, message: string) {
  try {
    // Find family by phone number
    const family = await prisma.family.findFirst({
      where: {
        OR: [
          { phoneNumber1: phoneNumber },
          { phoneNumber2: phoneNumber },
        ],
        smsOptIn: true,
      },
      include: {
        visits: {
          where: {
            status: {
              in: ['PENDING', 'ON_WAY'],
            },
          },
          orderBy: {
            order: 'asc',
          },
          take: 1,
        },
        tour: true,
      },
    });

    if (!family || family.visits.length === 0) {
      console.log(`No active visit found for phone number ${phoneNumber}`);
      return null;
    }

    const visit = family.visits[0];
    const responseType = parseSMSResponse(message);

    // Update visit status to SKIPPED
    const updatedVisit = await prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: 'SKIPPED',
        smsResponse: message,
        smsResponseAt: new Date(),
      },
      include: {
        family: true,
        tour: true,
      },
    });

    console.log(`✅ Visit ${visit.id} marked as SKIPPED due to SMS response: ${responseType || 'UNKNOWN'}`);

    return updatedVisit;
  } catch (error: any) {
    console.error('Error handling SMS response:', error);
    return null;
  }
}

