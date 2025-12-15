/**
 * ROI GUARDRAILS
 *
 * Implements ROI guardrail rules from specification:
 * - Export disabled when ROI > 300%
 * - Optional guardrail toggle to warn/prevent when ROI is below 100%
 * - Configurable behavior (warn only vs block)
 */

export interface GuardrailResult {
  allowed: boolean
  warning?: string
  error?: string
  severity: 'info' | 'warning' | 'error'
}

/**
 * Check if ROI exceeds the 300% threshold (export blocker)
 */
export function checkROIExportThreshold(roi: number): GuardrailResult {
  if (roi > 300) {
    return {
      allowed: false,
      error:
        'A result with an ROI over 300% requires a review. Please contact the Value Engineering team for support.',
      severity: 'error',
    }
  }

  return {
    allowed: true,
    severity: 'info',
  }
}

/**
 * Check ROI against guardrail warnings (100-300%)
 */
export function checkROIGuardrail(
  roi: number,
  guardrailEnabled: boolean,
  blockMode: boolean = false
): GuardrailResult {
  if (!guardrailEnabled) {
    return {
      allowed: true,
      severity: 'info',
    }
  }

  // ROI over 300% - hard block
  if (roi > 300) {
    return checkROIExportThreshold(roi)
  }

  // ROI below 100% - warning or block based on mode
  if (roi < 100) {
    const message =
      'ROI below 100% may indicate limited value. Please review your inputs to ensure accuracy.'

    if (blockMode) {
      return {
        allowed: false,
        error: message,
        severity: 'error',
      }
    } else {
      return {
        allowed: true,
        warning: message,
        severity: 'warning',
      }
    }
  }

  // ROI 100% and above - all good
  return {
    allowed: true,
    severity: 'info',
  }
}

/**
 * Check if manual override is allowed based on guardrails
 */
export function checkManualOverrideAllowed(
  originalValue: number,
  newValue: number,
  guardrailEnabled: boolean
): GuardrailResult {
  if (!guardrailEnabled) {
    return {
      allowed: true,
      severity: 'info',
    }
  }

  // Check if override would cause unrealistic values
  const percentChange = Math.abs(((newValue - originalValue) / originalValue) * 100)

  if (percentChange > 200) {
    return {
      allowed: false,
      error:
        'Manual override exceeds 200% change from default. This may indicate an unrealistic value.',
      severity: 'error',
    }
  }

  if (percentChange > 100) {
    return {
      allowed: true,
      warning:
        'Manual override exceeds 100% change from default. Please verify this value is correct.',
      severity: 'warning',
    }
  }

  return {
    allowed: true,
    severity: 'info',
  }
}

/**
 * Validate all inputs for export readiness
 */
export interface ExportReadinessCheck {
  canExport: boolean
  blockers: string[]
  warnings: string[]
}

export function checkExportReadiness(
  roi: number,
  opportunityComplete: boolean,
  agentDataComplete: boolean,
  pricingComplete: boolean,
  maturityComplete: boolean
): ExportReadinessCheck {
  const blockers: string[] = []
  const warnings: string[] = []

  // Check ROI threshold
  const roiCheck = checkROIExportThreshold(roi)
  if (!roiCheck.allowed && roiCheck.error) {
    blockers.push(roiCheck.error)
  }

  // Check required data completion
  if (!opportunityComplete) {
    blockers.push('Opportunity data is incomplete')
  }
  if (!agentDataComplete) {
    blockers.push('Agent data is incomplete')
  }
  if (!pricingComplete) {
    blockers.push('Pricing data is incomplete')
  }
  if (!maturityComplete) {
    warnings.push('Maturity assessment is incomplete - results may be less accurate')
  }

  // Check for low ROI
  if (roi < 100) {
    warnings.push(
      'ROI below 100% may indicate limited value. Please review calculations before sharing.'
    )
  }

  return {
    canExport: blockers.length === 0,
    blockers,
    warnings,
  }
}

/**
 * Check payback period for reasonableness
 */
export function checkPaybackPeriod(paybackMonths: number): GuardrailResult {
  if (paybackMonths < 1) {
    return {
      allowed: true,
      warning:
        'Payback period under 1 month is unusually fast. Please verify your inputs.',
      severity: 'warning',
    }
  }

  if (paybackMonths > 36) {
    return {
      allowed: true,
      warning:
        'Payback period over 3 years may indicate limited short-term value. Consider reviewing assumptions.',
      severity: 'warning',
    }
  }

  return {
    allowed: true,
    severity: 'info',
  }
}

/**
 * Check if benefit realization factors are reasonable
 */
export function checkBenefitRealizationFactors(factors: {
  year1: number
  year2: number
  year3: number
}): GuardrailResult {
  // Factors should generally increase year over year
  if (factors.year1 > factors.year2 || factors.year2 > factors.year3) {
    return {
      allowed: true,
      warning:
        'Benefit realization typically increases over time. Your factors decrease - is this intentional?',
      severity: 'warning',
    }
  }

  // Year 1 factor should generally be less than 100%
  if (factors.year1 >= 1.0) {
    return {
      allowed: true,
      warning:
        'Year 1 benefit realization at 100% assumes immediate full adoption - is this realistic?',
      severity: 'warning',
    }
  }

  return {
    allowed: true,
    severity: 'info',
  }
}

/**
 * Comprehensive validation for calculation inputs
 */
export function validateCalculationInputs(inputs: {
  hourlyRate: number
  totalCosts: number
  totalBenefits: number
  discountRate: number
}): GuardrailResult[] {
  const results: GuardrailResult[] = []

  // Check hourly rate is reasonable
  if (inputs.hourlyRate < 10 || inputs.hourlyRate > 500) {
    results.push({
      allowed: true,
      warning: `Hourly rate of $${inputs.hourlyRate.toFixed(
        2
      )} seems unusual. Typical range is $25-$150/hour.`,
      severity: 'warning',
    })
  }

  // Check total costs vs benefits ratio
  if (inputs.totalBenefits > 0 && inputs.totalCosts > 0) {
    const ratio = inputs.totalBenefits / inputs.totalCosts
    if (ratio > 10) {
      results.push({
        allowed: true,
        warning:
          'Benefits are more than 10x costs - please verify calculations are correct.',
        severity: 'warning',
      })
    }
  }

  // Check discount rate
  if (inputs.discountRate < 0 || inputs.discountRate > 50) {
    results.push({
      allowed: false,
      error: 'Discount rate should be between 0% and 50%',
      severity: 'error',
    })
  }

  return results
}
