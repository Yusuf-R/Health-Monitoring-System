/**
 * Formats a date consistently regardless of whether it's a JavaScript Date object,
 * Firebase Timestamp, or seconds/milliseconds timestamp
 *
 * @param {Date|Object|number} dateValue - The date value to format
 * @param {Object} options - Date formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
}) => {
    if (!dateValue) return 'N/A';

    let date;

    try {
        // Handle Firebase Timestamp (has seconds and nanoseconds)
        if (dateValue?.seconds) {
            date = new Date(dateValue.seconds * 1000);
        }
        // Handle regular JavaScript Date object
        else if (dateValue instanceof Date) {
            date = dateValue;
        }
        // Handle timestamp in milliseconds
        else if (typeof dateValue === 'number') {
            date = new Date(dateValue);
        }
        // Handle timestamp in seconds
        else if (typeof dateValue === 'string' && !isNaN(dateValue)) {
            date = new Date(Number(dateValue) * 1000);
        }
        // Handle ISO string or other date string formats
        else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
        }

        // Validate the date
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
};
