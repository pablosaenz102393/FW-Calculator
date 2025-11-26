/**
 * INPUT VALIDATION AND SANITIZATION UTILITIES
 *
 * Handles validation rules from the specification:
 * - No negative values
 * - Strip non-numeric characters except decimal and commas
 * - Percent bounds (0-100 or component-specific)
 * - Required field checking
 */

/**
 * Sanitize numeric input - accepts commas, strips non-numeric except decimal
 */
export function sanitizeNumericInput(value: string): string {
  // Remove all characters except digits, decimal point, and commas
  let sanitized = value.replace(/[^\d.,]/g, '')

  // Remove commas (they're just for display)
  sanitized = sanitized.replace(/,/g, '')

  // Ensure only one decimal point
  const parts = sanitized.split('.')
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('')
  }

  return sanitized
}

/**
 * Parse sanitized input to number
 */
export function parseNumericInput(value: string): number {
  const sanitized = sanitizeNumericInput(value)
  const parsed = parseFloat(sanitized)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format number with commas for display
 */
export function formatNumberWithCommas(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate numeric value is not negative
 */
export function validateNonNegative(value: number): ValidationResult {
  if (value < 0) {
    return {
      isValid: false,
      error: 'Value cannot be negative',
    }
  }
  return { isValid: true }
}

/**
 * Validate percentage is within bounds (0-100)
 */
export function validatePercentage(
  value: number,
  min: number = 0,
  max: number = 100
): ValidationResult {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `Percentage must be between ${min}% and ${max}%`,
    }
  }
  return { isValid: true }
}

/**
 * Validate required field is not empty
 */
export function validateRequired(value: any): ValidationResult {
  if (value === null || value === undefined || value === '' || value === 0) {
    return {
      isValid: false,
      error: 'This field is required',
    }
  }
  return { isValid: true }
}

/**
 * Validate number is within range
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number
): ValidationResult {
  if (min !== undefined && value < min) {
    return {
      isValid: false,
      error: `Value must be at least ${min}`,
    }
  }
  if (max !== undefined && value > max) {
    return {
      isValid: false,
      error: `Value must be no more than ${max}`,
    }
  }
  return { isValid: true }
}

/**
 * Validate discount rate (0-100)
 */
export function validateDiscountRate(value: number): ValidationResult {
  return validatePercentage(value, 0, 100)
}

/**
 * Validate benefit realization factor (0-1 expressed as 0-100%)
 */
export function validateBenefitRealizationFactor(value: number): ValidationResult {
  return validatePercentage(value, 0, 100)
}

/**
 * Composite validation for component input field
 */
export interface FieldValidationRules {
  required?: boolean
  min?: number
  max?: number
  type?: 'number' | 'percent' | 'currency' | 'hours'
}

export function validateField(
  value: any,
  rules: FieldValidationRules
): ValidationResult {
  // Check required
  if (rules.required) {
    const requiredCheck = validateRequired(value)
    if (!requiredCheck.isValid) {
      return requiredCheck
    }
  }

  // If value is empty and not required, it's valid
  if (!value && !rules.required) {
    return { isValid: true }
  }

  const numValue = typeof value === 'number' ? value : parseNumericInput(String(value))

  // Check non-negative
  const nonNegCheck = validateNonNegative(numValue)
  if (!nonNegCheck.isValid) {
    return nonNegCheck
  }

  // Check type-specific validation
  if (rules.type === 'percent') {
    const percentCheck = validatePercentage(numValue, rules.min, rules.max)
    if (!percentCheck.isValid) {
      return percentCheck
    }
  }

  // Check range
  if (rules.min !== undefined || rules.max !== undefined) {
    const rangeCheck = validateRange(numValue, rules.min, rules.max)
    if (!rangeCheck.isValid) {
      return rangeCheck
    }
  }

  return { isValid: true }
}

/**
 * Validate all fields in a form
 */
export function validateFields(
  fields: Record<string, any>,
  rules: Record<string, FieldValidationRules>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {}

  Object.keys(rules).forEach((fieldName) => {
    results[fieldName] = validateField(fields[fieldName], rules[fieldName])
  })

  return results
}

/**
 * Check if all validation results are valid
 */
export function areAllFieldsValid(
  validationResults: Record<string, ValidationResult>
): boolean {
  return Object.values(validationResults).every((result) => result.isValid)
}

/**
 * Validate opportunity data completeness
 */
export function validateOpportunityData(data: any): ValidationResult {
  if (!data.product) {
    return { isValid: false, error: 'Product is required' }
  }
  if (!data.engagement) {
    return { isValid: false, error: 'Engagement type is required' }
  }
  if (!data.plan) {
    return { isValid: false, error: 'Plan is required' }
  }
  if (!data.localCurrency) {
    return { isValid: false, error: 'Local currency is required' }
  }
  return { isValid: true }
}

/**
 * Validate agent data completeness
 */
export function validateAgentData(data: any): ValidationResult {
  const requiredFields = [
    'agentCount',
    'annualIncidents',
    'annualServiceRequests',
    'individualAgentExpense',
    'currentLicensing',
    'currentMaintenance',
  ]

  for (const field of requiredFields) {
    if (!data[field] || data[field] <= 0) {
      return {
        isValid: false,
        error: `${field} is required and must be greater than 0`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Validate pricing data
 */
export function validatePricingData(data: any): ValidationResult {
  if (!data.pricingType) {
    return { isValid: false, error: 'Pricing type is required' }
  }
  if (!data.unitPrice || data.unitPrice <= 0) {
    return { isValid: false, error: 'Unit price is required and must be greater than 0' }
  }
  if (data.implementationPrice === undefined || data.implementationPrice < 0) {
    return { isValid: false, error: 'Implementation price is required' }
  }
  return { isValid: true }
}
