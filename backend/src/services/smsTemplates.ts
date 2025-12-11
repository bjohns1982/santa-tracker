/**
 * SMS message templates for different scenarios
 */

/**
 * Generate tour start message with app link
 * @param tourName - Name of the tour
 * @param inviteCode - Tour invite code
 * @param appUrl - Base URL of the application
 * @returns Formatted message
 */
export function tourStartMessage(tourName: string, inviteCode: string, appUrl: string): string {
  const santaTrackerUrl = `${appUrl}/tour/${inviteCode}/signup`;
  return `🎅The ${tourName} has started! Santa is beginning his route now. We'll text you again when your home is next in line. Follow along on the Santa Tracker: ${santaTrackerUrl}`;
}

/**
 * Generate "on deck" message when family is next in line
 * @param familyName - Name of the family
 * @param estimatedMinutes - Estimated minutes until arrival
 * @returns Formatted message
 */
export function onDeckMessage(familyName: string, estimatedMinutes: number): string {
  // Format ETA nicely
  let etaText: string;
  if (estimatedMinutes === 1) {
    etaText = '1 minute';
  } else if (estimatedMinutes < 60) {
    etaText = `${estimatedMinutes} minutes`;
  } else {
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    if (minutes === 0) {
      etaText = hours === 1 ? '1 hour' : `${hours} hours`;
    } else {
      etaText = `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  return `🎅 You're next! Santa is headed your way. ETA: ${etaText}`;
}

