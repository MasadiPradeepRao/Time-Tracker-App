import { format, formatDuration as fDuration, intervalToDuration } from 'date-fns';

export function formatToLocalTime(isoString: string): string {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return format(date, 'h:mm:ss a'); // e.g. 5:30:00 PM
}

export function formatToLocalDate(isoString: string): string {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return format(date, 'MMM d, yyyy'); // e.g. Oct 12, 2023
}

export function calculateDuration(startIso: string, endIso: string | null): string {
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date(); // If running, use current time

    const duration = intervalToDuration({ start, end });

    // Format nicely, e.g. 2h 30m
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;

    return `${hours}h ${minutes}m`;
}
