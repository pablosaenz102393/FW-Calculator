/**
 * Formatting utility functions for ROI calculator
 */

/**
 * Format currency value
 */
export function formatCurrency(value: number, currencySymbol: string): string {
  return `${currencySymbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Format months
 */
export function formatMonths(value: number): string {
  return `${value.toFixed(1)} months`
}
