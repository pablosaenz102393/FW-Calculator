/**
 * CALCULATION ENGINE - ROI Calculator Formulas for All 19 Components
 *
 * This module implements exact formulas from the specification document.
 * All calculations follow the documented patterns for:
 * - Ticket Elimination
 * - Agent Productivity
 * - Cost Savings
 * - 3-Year Projections with Benefit Realization Factors
 */

import {
  ComponentResult,
  YearlyData,
  AnalysisResults,
  ResultsData,
  BenefitRealizationFactors,
} from '@/types'
import { getComponentById } from './controlPanel'

// Constants
const HOURS_PER_YEAR = 2080 // 40 hours/week × 52 weeks
const MINUTES_PER_HOUR = 60

/**
 * Calculate hourly loaded rate from annual salary
 */
function calculateHourlyRate(annualSalary: number): number {
  return annualSalary / HOURS_PER_YEAR
}

/**
 * Convert minutes to hours
 */
function minutesToHours(minutes: number): number {
  return minutes / MINUTES_PER_HOUR
}

/**
 * Convert percent to decimal
 */
function percentToDecimal(percent: number): number {
  return percent / 100
}

// ============================================================================
// TICKET ELIMINATION FORMULAS
// ============================================================================

/**
 * Generic Ticket Elimination Formula
 * ComponentValue = NumberOfTickets × (PercentEliminated / 100) × (TimeSavedMins / 60) × AvgLoadedHourly
 */
function calculateTicketElimination(
  numberOfTickets: number,
  percentEliminated: number,
  timeSavedMinutes: number,
  hourlyRate: number
): number {
  const ticketsEliminated = numberOfTickets * percentToDecimal(percentEliminated)
  const hoursFreed = ticketsEliminated * minutesToHours(timeSavedMinutes)
  return hoursFreed * hourlyRate
}

/**
 * Knowledge Base (ITSM)
 */
export function calculateKnowledgeBase(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTicketElimination(
    inputs.numberOfTickets || 0,
    inputs.percentEliminated || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * Automation of Service Requests (ITSM)
 */
export function calculateAutomationServiceRequests(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTicketElimination(
    inputs.numberOfTickets || 0,
    inputs.percentEliminated || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * Freddy AI Agent
 */
export function calculateFreddyAIAgent(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTicketElimination(
    inputs.numberOfTickets || 0,
    inputs.percentEliminated || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * Proactive Problem Management
 */
export function calculateProactiveProblemManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTicketElimination(
    inputs.numberOfTickets || 0,
    inputs.percentEliminated || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * ESM Ticket Elimination
 */
export function calculateESMTicketElimination(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  const totalESMTickets =
    (inputs.hrTickets || 0) +
    (inputs.facilitiesTickets || 0) +
    (inputs.legalTickets || 0) +
    (inputs.financeTickets || 0)

  return calculateTicketElimination(
    totalESMTickets,
    inputs.percentEliminated || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

// ============================================================================
// AGENT PRODUCTIVITY FORMULAS
// ============================================================================

/**
 * Standard Agent Productivity Formula
 * ComponentValue = TicketsRemaining × (TimeSavedMins / 60) × AvgLoadedHourly
 */
function calculateAgentProductivityStandard(
  ticketsRemaining: number,
  timeSavedMinutes: number,
  hourlyRate: number
): number {
  const hoursFreed = ticketsRemaining * minutesToHours(timeSavedMinutes)
  return hoursFreed * hourlyRate
}

/**
 * Incident Management
 */
export function calculateIncidentManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateAgentProductivityStandard(
    inputs.ticketsRemaining || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * Service Request Management
 */
export function calculateServiceRequestManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateAgentProductivityStandard(
    inputs.requestsRemaining || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * Problem Management
 */
export function calculateProblemManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateAgentProductivityStandard(
    inputs.numberOfProblems || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * Change Management (Failed Changes Reduction)
 * ComponentValue = NumberOfChanges × AvgPctFailedChanges × (PctReductionInFailedChanges / 100)
 *                  × (TimeSavedMins / 60) × AvgLoadedHourly
 */
export function calculateChangeManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  const numberOfChanges = inputs.numberOfChanges || 0
  const avgPercentFailed = percentToDecimal(inputs.avgPercentFailedChanges || 0)
  const percentReduction = percentToDecimal(inputs.percentReductionInFailedChanges || 0)
  const timeSavedMinutes = inputs.timeSavedMinutes || 0

  const failedChangesReduced = numberOfChanges * avgPercentFailed * percentReduction
  const hoursFreed = failedChangesReduced * minutesToHours(timeSavedMinutes)
  return hoursFreed * hourlyRate
}

/**
 * Time-Based Productivity Formula
 * ComponentValue = TimeSpentTodayHours × (PercentTimeSaved / 100) × AvgLoadedHourly
 */
function calculateTimeBasedProductivity(
  timeSpentTodayHours: number,
  percentTimeSaved: number,
  hourlyRate: number
): number {
  // Annualize weekly hours
  const annualHours = timeSpentTodayHours * 52
  const hoursSaved = annualHours * percentToDecimal(percentTimeSaved)
  return hoursSaved * hourlyRate
}

/**
 * Project Management
 */
export function calculateProjectManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTimeBasedProductivity(
    inputs.timeSpentTodayHours || 0,
    inputs.percentTimeSaved || 0,
    hourlyRate
  )
}

/**
 * Asset Management
 */
export function calculateAssetManagement(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTimeBasedProductivity(
    inputs.timeSpentTodayHours || 0,
    inputs.percentTimeSaved || 0,
    hourlyRate
  )
}

/**
 * CMDB
 */
export function calculateCMDB(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateTimeBasedProductivity(
    inputs.timeSpentTodayHours || 0,
    inputs.percentTimeSaved || 0,
    hourlyRate
  )
}

/**
 * Service Catalog Expansion
 */
export function calculateServiceCatalogExpansion(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  return calculateAgentProductivityStandard(
    inputs.additionalCatalogRequests || 0,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

/**
 * ESM Agent Productivity
 */
export function calculateESMAgentProductivity(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  const totalESMTicketsRemaining =
    (inputs.hrTicketsRemaining || 0) +
    (inputs.facilitiesTicketsRemaining || 0) +
    (inputs.legalTicketsRemaining || 0) +
    (inputs.financeTicketsRemaining || 0)

  return calculateAgentProductivityStandard(
    totalESMTicketsRemaining,
    inputs.timeSavedMinutes || 0,
    hourlyRate
  )
}

// ============================================================================
// COST SAVINGS FORMULAS
// ============================================================================

/**
 * License Consolidation
 */
export function calculateLicenseConsolidation(
  inputs: Record<string, number>
): number {
  const numberOfTools = inputs.numberOfToolsEliminated || 0
  const costPerTool = inputs.costPerToolEliminated || 0
  return numberOfTools * costPerTool
}

/**
 * Infrastructure Savings
 */
export function calculateInfrastructureSavings(
  inputs: Record<string, number>
): number {
  const costBefore = inputs.annualInfraCostBefore || 0
  const costAfter = inputs.annualInfraCostAfter || 0
  return Math.max(0, costBefore - costAfter)
}

/**
 * Vendor Spend Reduction
 */
export function calculateVendorSpendReduction(
  inputs: Record<string, number>
): number {
  const currentSpend = inputs.currentVendorSpend || 0
  const percentReduction = percentToDecimal(inputs.percentReduction || 0)
  return currentSpend * percentReduction
}

/**
 * ESM Shared Services Savings
 */
export function calculateESMSharedServices(
  inputs: Record<string, number>
): number {
  const totalBudget =
    (inputs.hrBudget || 0) +
    (inputs.facilitiesBudget || 0) +
    (inputs.legalBudget || 0) +
    (inputs.financeBudget || 0)

  const percentSaved = percentToDecimal(inputs.percentSaved || 0)
  return totalBudget * percentSaved
}

/**
 * Freddy Copilot Savings
 */
export function calculateFreddyCopilotSavings(
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  const numberOfInteractions = inputs.numberOfInteractions || 0
  const percentHandled = percentToDecimal(inputs.percentHandledByAI || 0)
  const timeSavedMinutes = inputs.timeSavedMinutes || 0

  const interactionsAssisted = numberOfInteractions * percentHandled
  const hoursFreed = interactionsAssisted * minutesToHours(timeSavedMinutes)
  return hoursFreed * hourlyRate
}

// ============================================================================
// COMPONENT CALCULATION ROUTER
// ============================================================================

/**
 * Calculate benefit for a single component
 */
export function calculateComponentBenefit(
  componentId: string,
  inputs: Record<string, number>,
  hourlyRate: number
): number {
  switch (componentId) {
    // Ticket Elimination
    case 'knowledgeBase':
      return calculateKnowledgeBase(inputs, hourlyRate)
    case 'automationServiceRequests':
      return calculateAutomationServiceRequests(inputs, hourlyRate)
    case 'freddyAIAgent':
      return calculateFreddyAIAgent(inputs, hourlyRate)
    case 'proactiveProblemManagement':
      return calculateProactiveProblemManagement(inputs, hourlyRate)
    case 'esmTicketElimination':
      return calculateESMTicketElimination(inputs, hourlyRate)

    // Agent Productivity
    case 'incidentManagement':
      return calculateIncidentManagement(inputs, hourlyRate)
    case 'serviceRequestManagement':
      return calculateServiceRequestManagement(inputs, hourlyRate)
    case 'problemManagement':
      return calculateProblemManagement(inputs, hourlyRate)
    case 'changeManagement':
      return calculateChangeManagement(inputs, hourlyRate)
    case 'projectManagement':
      return calculateProjectManagement(inputs, hourlyRate)
    case 'assetManagement':
      return calculateAssetManagement(inputs, hourlyRate)
    case 'cmdb':
      return calculateCMDB(inputs, hourlyRate)
    case 'serviceCatalogExpansion':
      return calculateServiceCatalogExpansion(inputs, hourlyRate)
    case 'esmAgentProductivity':
      return calculateESMAgentProductivity(inputs, hourlyRate)

    // Cost Savings
    case 'licenseConsolidation':
      return calculateLicenseConsolidation(inputs)
    case 'infrastructureSavings':
      return calculateInfrastructureSavings(inputs)
    case 'vendorSpendReduction':
      return calculateVendorSpendReduction(inputs)
    case 'esmSharedServices':
      return calculateESMSharedServices(inputs)
    case 'freddyCopilotSavings':
      return calculateFreddyCopilotSavings(inputs, hourlyRate)

    default:
      console.warn(`Unknown component ID: ${componentId}`)
      return 0
  }
}

// ============================================================================
// 3-YEAR PROJECTION CALCULATIONS
// ============================================================================

/**
 * Apply benefit realization factors to annual benefit
 */
export function applyBenefitRealization(
  annualBenefit: number,
  factors: BenefitRealizationFactors
): { year1: number; year2: number; year3: number } {
  return {
    year1: annualBenefit * factors.year1,
    year2: annualBenefit * factors.year2,
    year3: annualBenefit * factors.year3,
  }
}

/**
 * Calculate ROI percentage
 * ROI (%) = (TotalNetCashFlow3yr / TotalCosts3yr) × 100
 */
export function calculateROI(totalNetCashFlow: number, totalCosts: number): number {
  if (totalCosts === 0) return 0
  return (totalNetCashFlow / totalCosts) * 100
}

/**
 * Calculate Payback Period in months
 * PaybackMonths = (TotalCosts / RealizedBenefitYear1) × 12
 */
export function calculatePaybackPeriod(
  totalCosts: number,
  year1Benefits: number
): number {
  if (year1Benefits === 0) return Infinity
  const years = totalCosts / year1Benefits
  return years * 12
}

/**
 * Calculate ticket dependencies
 * Returns tickets remaining after elimination components run
 */
export function calculateTicketDependencies(
  componentResults: ComponentResult[],
  totalIncidents: number,
  totalServiceRequests: number
): { incidentsRemaining: number; serviceRequestsRemaining: number } {
  // This is a simplified version - would need more sophisticated logic
  // based on which components eliminate which ticket types
  const totalTickets = totalIncidents + totalServiceRequests

  // Find ticket elimination components
  const eliminationComponents = componentResults.filter(
    (c) => c.category === 'ticketElimination'
  )

  // Calculate percentage eliminated (simplified)
  // In reality, would need to track which components affect which ticket pools
  const totalEliminationBenefit = eliminationComponents.reduce(
    (sum, c) => sum + c.annualBenefit,
    0
  )

  // Estimate tickets eliminated based on benefits
  // This is a placeholder - actual logic would be more complex
  const estimatedPercentEliminated = 0.15 // Default 15% assumption
  const ticketsRemaining = totalTickets * (1 - estimatedPercentEliminated)

  return {
    incidentsRemaining: ticketsRemaining * 0.6, // Assume 60% incidents
    serviceRequestsRemaining: ticketsRemaining * 0.4, // 40% service requests
  }
}

// ============================================================================
// MAIN CALCULATION ENGINE
// ============================================================================

/**
 * Main calculation function that orchestrates all component calculations
 */
export interface CalculationInputs {
  hourlyRate: number
  componentData: Record<
    string,
    {
      inputs: Record<string, number>
      enabled: boolean
    }
  >
  costs: {
    year1License: number
    year2License: number
    year3License: number
    year1Freddy: number
    year2Freddy: number
    year3Freddy: number
    implementation: number
  }
  benefitRealizationFactors: BenefitRealizationFactors
  discountRate: number
}

export function calculateROIResults(inputs: CalculationInputs): ResultsData {
  const componentResults: ComponentResult[] = []

  // Calculate each enabled component
  Object.entries(inputs.componentData).forEach(([componentId, data]) => {
    if (!data.enabled) return

    const config = getComponentById(componentId)
    if (!config) return

    const annualBenefit = calculateComponentBenefit(
      componentId,
      data.inputs,
      inputs.hourlyRate
    )

    const realized = applyBenefitRealization(
      annualBenefit,
      inputs.benefitRealizationFactors
    )

    componentResults.push({
      componentId,
      componentName: config.name,
      category: config.category,
      annualBenefit,
      year1: realized.year1,
      year2: realized.year2,
      year3: realized.year3,
      total: realized.year1 + realized.year2 + realized.year3,
    })
  })

  // Calculate yearly data
  const yearlyData: YearlyData[] = [
    {
      year: 1,
      benefits: componentResults.reduce((sum, c) => sum + c.year1, 0),
      costs:
        inputs.costs.year1License +
        inputs.costs.year1Freddy +
        inputs.costs.implementation,
      netCashFlow: 0,
      realizedBenefits: 0,
    },
    {
      year: 2,
      benefits: componentResults.reduce((sum, c) => sum + c.year2, 0),
      costs: inputs.costs.year2License + inputs.costs.year2Freddy,
      netCashFlow: 0,
      realizedBenefits: 0,
    },
    {
      year: 3,
      benefits: componentResults.reduce((sum, c) => sum + c.year3, 0),
      costs: inputs.costs.year3License + inputs.costs.year3Freddy,
      netCashFlow: 0,
      realizedBenefits: 0,
    },
  ]

  // Calculate net cash flow for each year
  yearlyData.forEach((year) => {
    year.realizedBenefits = year.benefits
    year.netCashFlow = year.benefits - year.costs
  })

  // Calculate aggregate metrics
  const totalBenefits3yr = yearlyData.reduce((sum, y) => sum + y.benefits, 0)
  const totalCosts3yr = yearlyData.reduce((sum, y) => sum + y.costs, 0)
  const totalNetCashFlow3yr = yearlyData.reduce((sum, y) => sum + y.netCashFlow, 0)

  const roi = calculateROI(totalNetCashFlow3yr, totalCosts3yr)
  const paybackPeriod = calculatePaybackPeriod(totalCosts3yr, yearlyData[0].benefits)

  const analysisResults: AnalysisResults = {
    roi,
    paybackPeriod,
    totalBenefits3yr,
    totalCosts3yr,
  }

  return {
    componentResults,
    yearlyData,
    analysisResults,
    discountRate: inputs.discountRate,
    benefitRealizationFactors: inputs.benefitRealizationFactors,
  }
}
