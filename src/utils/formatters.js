/**
 * Formats a number into Indian currency notation with suffixes (k, L, Cr).
 * @param {number} value - The number to format.
 * @returns {string} - The formatted string (e.g., "1.5 Cr", "50 L").
 */
export const formatIndianCurrency = (value) => {
    if (value >= 10000000) {
        return (value / 10000000).toFixed(2) + ' Cr';
    } else if (value >= 100000) {
        return (value / 100000).toFixed(2) + ' L';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + ' k';
    } else {
        return value.toString();
    }
};
