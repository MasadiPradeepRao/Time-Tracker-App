import { intervalToDuration } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

// --- Timezone Logic Helpers ---

/**
 * Returns the UTC ISO string corresponding to the start of the day in the SPECIFIED timezone.
 * Example: User in NY (-5). "Today" starts at 05:00 UTC.
 */
export function getStartOfDayInUTC(date: Date = new Date(), timezone: string): string {
    // 1. Get the "YYYY-MM-DD" string in the target timezone
    const localDateStr = formatInTimeZone(date, timezone, 'yyyy-MM-dd');

    // 2. Create midnight in that timezone -> Convert to UTC
    const utcDate = fromZonedTime(`${localDateStr} 00:00:00`, timezone);
    return utcDate.toISOString();
}

export function getEndOfDayInUTC(date: Date = new Date(), timezone: string): string {
    // 1. Get the "YYYY-MM-DD" string in the target timezone
    const localDateStr = formatInTimeZone(date, timezone, 'yyyy-MM-dd');

    // 2. Create end of day (23:59:59.999) in that timezone -> Convert to UTC
    const utcDate = fromZonedTime(`${localDateStr} 23:59:59.999`, timezone);
    return utcDate.toISOString();
}

export function getStartOfMonthInUTC(date: Date = new Date(), timezone: string): string {
    // 1. Get "YYYY-MM"
    const localMonthStr = formatInTimeZone(date, timezone, 'yyyy-MM');

    // 2. Start of month is 01 00:00:00
    const utcDate = fromZonedTime(`${localMonthStr}-01 00:00:00`, timezone);
    return utcDate.toISOString();
}

export function getEndOfMonthInUTC(date: Date = new Date(), timezone: string): string {
    // To find the end of the month, we can go to the start of the next month and subtract 1ms,
    // OR just use date math.

    // 1. Get start of month in target timezone
    const localMonthStr = formatInTimeZone(date, timezone, 'yyyy-MM');
    const startOfMonth = fromZonedTime(`${localMonthStr}-01 00:00:00`, timezone);

    // 2. Add 1 month to get start of next month (safely handled by Date object)
    // Note: This relies on the fact that adding 1 month to a UTC date usually works, 
    // BUT for timezone accuracy, it's safer to get the NEXT month string.

    const d = new Date(startOfMonth);
    d.setMonth(d.getMonth() + 1);

    // This gives us roughly the start of next month in UTC. 
    // However, to be precise in the Timezone:
    // Let's get the "YYYY-MM" of the NEXT month.
    // Actually, `date-fns` `endOfMonth` is good but it works on System Time or UTC.

    // Robust approach:
    // Get YYYY, MM of current date in Timezone.
    const year = parseInt(formatInTimeZone(date, timezone, 'yyyy'));
    const month = parseInt(formatInTimeZone(date, timezone, 'MM')); // 1-12

    // Determine next month
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
    }

    const nextMonthStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;
    const startOfNextMonth = fromZonedTime(nextMonthStr, timezone);

    // Subtract 1ms
    return new Date(startOfNextMonth.getTime() - 1).toISOString();
}

// --- Formatting Helpers (For UI) ---

export function formatToLocalTime(isoString: string, timezone: string): string {
    if (!isoString) return '-';
    // Display strictly in the user's timezone
    return formatInTimeZone(new Date(isoString), timezone, 'h:mm:ss a');
}

export function formatToLocalDate(isoString: string, timezone: string): string {
    if (!isoString) return '-';
    return formatInTimeZone(new Date(isoString), timezone, 'MMM d, yyyy');
}

/**
 * Returns a YYYY-MM-DD string representing the LOCAL date of the event.
 * Used for grouping.
 */
export function getLocalDayKey(isoString: string, timezone: string): string {
    if (!isoString) return '';
    return formatInTimeZone(new Date(isoString), timezone, 'yyyy-MM-dd');
}


export function calculateDuration(startIso: string, endIso: string | null): string {
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date(); // If running, use current time

    // Duration is independent of timezone (absolute time difference)
    const duration = intervalToDuration({ start, end });

    // Format nicely, e.g. 2h 30m
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;

    return `${hours}h ${minutes}m`;
}
