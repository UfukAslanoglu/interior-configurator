/**
 * Formats a meter value for display, e.g. `1.85 m`.
 * @param {number} value
 * @param {number} [fractionDigits=2]
 */
export function formatMeters(value, fractionDigits = 2) {
  return `${value.toFixed(fractionDigits)} m`;
}

/**
 * Converts meters to centimeters for display, e.g. `240 cm`.
 * @param {number} valueInMeters
 * @param {number} [fractionDigits=0]
 */
export function formatCentimeters(valueInMeters, fractionDigits = 0) {
  return `${(valueInMeters * 100).toFixed(fractionDigits)} cm`;
}

/**
 * Formats a price using Turkish locale/currency conventions.
 * @param {number} value
 * @param {string} [currency='TRY']
 */
export function formatPrice(value, currency = 'TRY') {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

/**
 * Formats a radian rotation as a rounded degree string, e.g. `90°`.
 * @param {number} radians
 */
export function formatDegrees(radians) {
  return `${Math.round((radians * 180) / Math.PI)}°`;
}
