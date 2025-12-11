/**
 * Phone number validation and formatting utilities
 */

/**
 * Validates a phone number in the format +1XXXXXXXXXX (11 characters total)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters except the leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Must start with +1 and have exactly 11 more digits (total 12 characters)
  const phoneRegex = /^\+1\d{10}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Formats a phone number to +1XXXXXXXXXX format
 * Strips dashes, spaces, parentheses, and adds +1 prefix if missing
 * @param phone - Phone number to format
 * @returns Formatted phone number or null if invalid
 */
export function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1, remove it (we'll add +1)
  const cleaned = digits.startsWith('1') ? digits.slice(1) : digits;
  
  // Must be exactly 10 digits
  if (cleaned.length !== 10) {
    return null;
  }
  
  // Format as +1XXXXXXXXXX
  return `+1${cleaned}`;
}

/**
 * Normalizes phone number input for display (e.g., +1 (618) 123-4567)
 * @param phone - Phone number in +1XXXXXXXXXX format
 * @returns Formatted display string or original if invalid
 */
export function formatPhoneNumberForDisplay(phone: string): string {
  if (!phone || !validatePhoneNumber(phone)) {
    return phone;
  }
  
  // Extract the 10 digits after +1
  const digits = phone.slice(2);
  const areaCode = digits.slice(0, 3);
  const firstPart = digits.slice(3, 6);
  const lastPart = digits.slice(6);
  
  return `+1 (${areaCode}) ${firstPart}-${lastPart}`;
}

