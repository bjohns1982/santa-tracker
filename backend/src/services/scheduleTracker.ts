// Calculate if Santa is ahead or behind schedule

export interface ScheduleStatus {
  status: 'ahead' | 'on-time' | 'behind';
  minutesDifference: number;
  message: string;
}

const MINUTES_PER_VISIT = 5;

export function calculateScheduleStatus(
  tourStartedAt: Date,
  currentVisitOrder: number,
  totalVisits: number
): ScheduleStatus {
  const now = new Date();
  const elapsedMinutes = (now.getTime() - tourStartedAt.getTime()) / (1000 * 60);
  const expectedMinutes = currentVisitOrder * MINUTES_PER_VISIT;
  const difference = elapsedMinutes - expectedMinutes;

  // Tolerance: within 2 minutes is considered "on-time"
  if (Math.abs(difference) <= 2) {
    return {
      status: 'on-time',
      minutesDifference: difference,
      message: "Santa's right on schedule! 🎅",
    };
  }

  if (difference < -2) {
    return {
      status: 'ahead',
      minutesDifference: Math.abs(difference),
      message: `Santa's running ahead by ${Math.round(Math.abs(difference))} minutes! 🎉`,
    };
  }

  return {
    status: 'behind',
    minutesDifference: difference,
    message: `Santa's running a bit behind by ${Math.round(difference)} minutes... 🕐`,
  };
}

export function calculateETA(
  currentVisitOrder: number,
  familyOrder: number,
  tourStartedAt: Date
): Date {
  const visitsRemaining = Math.max(0, familyOrder - currentVisitOrder);
  const minutesUntilArrival = visitsRemaining * MINUTES_PER_VISIT;
  const now = new Date();
  const eta = new Date(now.getTime() + minutesUntilArrival * 60 * 1000);
  return eta;
}

