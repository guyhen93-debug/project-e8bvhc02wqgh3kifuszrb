/**
 * Shared date utility functions for OXYGYM Tracker.
 * Centralizes date handling to avoid code duplication.
 */

/**
 * Gets today's date as a string in YYYY-MM-DD format.
 */
export const getTodayString = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Gets the start of the current week (Sunday) as a YYYY-MM-DD string.
 * Week starts on Sunday (day 0).
 */
export const getStartOfWeek = (): string => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = dayOfWeek === 0 ? 0 : dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString().split('T')[0];
};

/**
 * Checks if a date string represents today.
 */
export const isDateToday = (dateStr: string): boolean => {
    return dateStr === getTodayString();
};

/**
 * Formats a date string for display in Hebrew locale.
 */
export const formatDateHebrew = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('he-IL');
};

/**
 * Gets the milliseconds until midnight (for scheduling midnight refreshes).
 */
export const getMsUntilMidnight = (): number => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    return midnight.getTime() - now.getTime();
};
