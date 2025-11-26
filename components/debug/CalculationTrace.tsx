'use client'

import { useState } from 'react'
import {
  ResultsData,
  WizardState,
  ComponentResult,
  YearlyData,
  CURRENCY_SYMBOLS,
} from '@/types'
import { getVisibleComponents, getComponentById, COMPONENT_CONFIGURATIONS } from '@/lib/controlPanel'
import { FREDDY_COPILOT_PRICE_PER_AGENT } from '@/lib/data'

interface CalculationTraceProps {
  state: WizardState
  calculatedResults: ResultsData
}

export default function CalculationTrace({
  state,
  calculatedResults,
}: CalculationTraceProps) {
  const [showRawData, setShowRawData] = useState(false)

  const { agentData, opportunity, pricing, componentData } = state
  const { componentResults, yearlyData, analysisResults, discountRate, benefitRealizationFactors } =
    calculatedResults

  const currencySymbol = opportunity.localCurrency
    ? CURRENCY_SYMBOLS[opportunity.localCurrency]
    : '$'

  // Calculate hourly rate
  const hourlyRate = agentData.individualAgentExpense
    ? agentData.individualAgentExpense / 2080
    : 0

  // Format currency
  const fc = (value: number) => {
    return `${currencySymbol}${value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  // Format number
  const fn = (value: number, decimals = 2) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  // Format percentage
  const fp = (value: number) => {
    return `${fn(value, 1)}%`
  }

  // Get component input data
  const getComponentInputs = (componentId: string): Record<string, number> => {
    return componentData[componentId]?.inputs || {}
  }

  // Get calculation steps for each component type
  // Validation checks for inputs
  const getValidationIssues = () => {
    const issues: { type: 'error' | 'warning' | 'success'; message: string }[] = []

    // Agent count validation
    if (!agentData.agentCount || agentData.agentCount === 0) {
      issues.push({ type: 'error', message: 'Agent Count: Missing or zero (required >0)' })
    } else {
      issues.push({ type: 'success', message: `Agent Count: ${fn(agentData.agentCount, 0)} (valid)` })
    }

    // Individual agent expense validation
    if (!agentData.individualAgentExpense || agentData.individualAgentExpense === 0) {
      issues.push({ type: 'error', message: 'Individual Agent Expense: Missing or zero (required >0)' })
    } else {
      issues.push({ type: 'success', message: `Individual Agent Expense: ${fc(agentData.individualAgentExpense)} (valid)` })
    }

    // Annual incidents validation
    if (agentData.annualIncidents === 0) {
      issues.push({ type: 'warning', message: 'Annual Incidents: Zero (unusually low - verify this is correct)' })
    } else {
      issues.push({ type: 'success', message: `Annual Incidents: ${fn(agentData.annualIncidents || 0, 0)} (valid)` })
    }

    // Annual service requests validation (EX only)
    if (opportunity.product === 'EX') {
      if (agentData.annualServiceRequests === 0) {
        issues.push({ type: 'warning', message: 'Annual Service Requests: Zero (unusually low - verify this is correct)' })
      } else {
        issues.push({ type: 'success', message: `Annual Service Requests: ${fn(agentData.annualServiceRequests || 0, 0)} (valid)` })
      }
    }

    // Pricing validation
    if (!pricing.unitPrice || pricing.unitPrice === 0) {
      issues.push({ type: 'error', message: 'Unit Price: Missing or zero' })
    } else {
      issues.push({ type: 'success', message: `Unit Price: ${fc(pricing.unitPrice)} (valid)` })
    }

    // Implementation price (optional but typically >0)
    if (pricing.implementationPrice === 0) {
      issues.push({ type: 'warning', message: 'Implementation Price: Zero (typically >0 for new implementations)' })
    } else {
      issues.push({ type: 'success', message: `Implementation Price: ${fc(pricing.implementationPrice || 0)} (valid)` })
    }

    // Current licensing (can be 0 for new customers)
    if (agentData.currentLicensing === 0 && opportunity.engagement === 'Existing') {
      issues.push({ type: 'warning', message: 'Current Licensing: Zero (unusual for existing customer)' })
    } else {
      issues.push({ type: 'success', message: `Current Licensing: ${fc(agentData.currentLicensing || 0)} (valid)` })
    }

    return issues
  }

  const validationIssues = getValidationIssues()

  // Get component enablement status
  const getComponentStatus = () => {
    const plan = opportunity.plan || 'Growth'
    const esmEnabled = opportunity.esm || false
    const freddyEnabled = opportunity.freddyCoPilot || false

    const visibleComponents = getVisibleComponents(plan, esmEnabled, freddyEnabled)
    const enabledComponents = componentResults.map(c => c.componentId)

    const enabled = COMPONENT_CONFIGURATIONS.filter(c => enabledComponents.includes(c.id))
    const disabled = COMPONENT_CONFIGURATIONS.filter(c => !enabledComponents.includes(c.id))

    return {
      total: COMPONENT_CONFIGURATIONS.length,
      enabledCount: enabled.length,
      enabled,
      disabled,
    }
  }

  const componentStatus = getComponentStatus()

  // Get maturity impact for a component
  const getMaturityImpact = (componentId: string) => {
    const config = getComponentById(componentId)
    if (!config || !config.supportsMaturity) return null

    const componentData = state.componentData[componentId]
    const selectedLevel = componentData?.maturityLevel
    const customPercentage = componentData?.customPercentage

    // Get the component result to see actual benefit
    const result = componentResults.find(c => c.componentId === componentId)

    return {
      componentName: config.name,
      selectedLevel,
      customPercentage,
      maturityDefaults: config.maturityDefaults,
      otherRange: config.otherRange,
      actualBenefit: result?.annualBenefit || 0,
    }
  }

  const getCalculationSteps = (component: ComponentResult) => {
    const inputs = getComponentInputs(component.componentId)
    const steps: { label: string; value: string; description?: string }[] = []

    // Ticket Elimination Components
    if (
      [
        'knowledgeBase',
        'automationServiceRequests',
        'freddyAIAgent',
        'proactiveProblemManagement',
      ].includes(component.componentId)
    ) {
      const tickets = inputs.numberOfTickets || 0
      const pctEliminated = inputs.percentEliminated || 0
      const timeSaved = inputs.timeSavedMinutes || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Tickets × (% Eliminated ÷ 100) × (Mins Saved ÷ 60) × Hourly Rate`,
        description: 'Standard ticket elimination formula',
      })
      steps.push({
        label: 'Inputs',
        value: `Tickets: ${fn(tickets, 0)} | % Eliminated: ${fp(pctEliminated)} | Time Saved: ${fn(timeSaved, 0)} mins | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const ticketsEliminated = tickets * (pctEliminated / 100)
      const hoursFreed = ticketsEliminated * (timeSaved / 60)

      steps.push({
        label: 'Step 1: Tickets Eliminated',
        value: `${fn(tickets, 0)} × (${fp(pctEliminated)} ÷ 100) = ${fn(ticketsEliminated, 2)} tickets`,
      })
      steps.push({
        label: 'Step 2: Hours Freed',
        value: `${fn(ticketsEliminated, 2)} × (${fn(timeSaved, 0)} ÷ 60) = ${fn(hoursFreed, 2)} hours`,
      })
      steps.push({
        label: 'Step 3: Annual Benefit',
        value: `${fn(hoursFreed, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // ESM Ticket Elimination (aggregates 4 departments)
    else if (component.componentId === 'esmTicketElimination') {
      const hrTickets = inputs.hrTickets || 0
      const facilitiesTickets = inputs.facilitiesTickets || 0
      const legalTickets = inputs.legalTickets || 0
      const financeTickets = inputs.financeTickets || 0
      const totalTickets = hrTickets + facilitiesTickets + legalTickets + financeTickets
      const pctEliminated = inputs.percentEliminated || 0
      const timeSaved = inputs.timeSavedMinutes || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Total ESM Tickets × (% Eliminated ÷ 100) × (Mins Saved ÷ 60) × Hourly Rate`,
        description: 'Aggregates tickets from HR, Facilities, Legal, and Finance',
      })
      steps.push({
        label: 'Inputs',
        value: `HR: ${fn(hrTickets, 0)} | Facilities: ${fn(facilitiesTickets, 0)} | Legal: ${fn(legalTickets, 0)} | Finance: ${fn(financeTickets, 0)}`,
      })
      steps.push({
        label: 'ESM Tickets',
        value: `% Eliminated: ${fp(pctEliminated)} | Time Saved: ${fn(timeSaved, 0)} mins | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const ticketsEliminated = totalTickets * (pctEliminated / 100)
      const hoursFreed = ticketsEliminated * (timeSaved / 60)

      steps.push({
        label: 'Step 1: Total ESM Tickets',
        value: `${fn(hrTickets, 0)} + ${fn(facilitiesTickets, 0)} + ${fn(legalTickets, 0)} + ${fn(financeTickets, 0)} = ${fn(totalTickets, 0)} tickets`,
      })
      steps.push({
        label: 'Step 2: Tickets Eliminated',
        value: `${fn(totalTickets, 0)} × (${fp(pctEliminated)} ÷ 100) = ${fn(ticketsEliminated, 2)} tickets`,
      })
      steps.push({
        label: 'Step 3: Hours Freed',
        value: `${fn(ticketsEliminated, 2)} × (${fn(timeSaved, 0)} ÷ 60) = ${fn(hoursFreed, 2)} hours`,
      })
      steps.push({
        label: 'Step 4: Annual Benefit',
        value: `${fn(hoursFreed, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // Standard Agent Productivity
    else if (
      [
        'incidentManagement',
        'serviceRequestManagement',
        'problemManagement',
        'serviceCatalogExpansion',
      ].includes(component.componentId)
    ) {
      const ticketsRemaining = inputs.ticketsRemaining || 0
      const timeSaved = inputs.timeSavedMinutes || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Tickets × (Mins Saved ÷ 60) × Hourly Rate`,
        description: 'Standard agent productivity formula',
      })
      steps.push({
        label: 'Inputs',
        value: `Tickets: ${fn(ticketsRemaining, 0)} | Time Saved: ${fn(timeSaved, 0)} mins | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const hoursFreed = ticketsRemaining * (timeSaved / 60)

      steps.push({
        label: 'Step 1: Hours Freed',
        value: `${fn(ticketsRemaining, 0)} × (${fn(timeSaved, 0)} ÷ 60) = ${fn(hoursFreed, 2)} hours`,
      })
      steps.push({
        label: 'Step 2: Annual Benefit',
        value: `${fn(hoursFreed, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // ESM Agent Productivity (aggregates 4 departments)
    else if (component.componentId === 'esmAgentProductivity') {
      const hrTickets = inputs.hrTicketsRemaining || 0
      const facilitiesTickets = inputs.facilitiesTicketsRemaining || 0
      const legalTickets = inputs.legalTicketsRemaining || 0
      const financeTickets = inputs.financeTicketsRemaining || 0
      const totalTickets = hrTickets + facilitiesTickets + legalTickets + financeTickets
      const timeSaved = inputs.timeSavedMinutes || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Total ESM Tickets × (Mins Saved ÷ 60) × Hourly Rate`,
        description: 'Aggregates remaining tickets from HR, Facilities, Legal, and Finance',
      })
      steps.push({
        label: 'Inputs',
        value: `HR: ${fn(hrTickets, 0)} | Facilities: ${fn(facilitiesTickets, 0)} | Legal: ${fn(legalTickets, 0)} | Finance: ${fn(financeTickets, 0)}`,
      })
      steps.push({
        label: 'ESM Tickets',
        value: `Time Saved: ${fn(timeSaved, 0)} mins | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const hoursFreed = totalTickets * (timeSaved / 60)

      steps.push({
        label: 'Step 1: Total ESM Tickets',
        value: `${fn(hrTickets, 0)} + ${fn(facilitiesTickets, 0)} + ${fn(legalTickets, 0)} + ${fn(financeTickets, 0)} = ${fn(totalTickets, 0)} tickets`,
      })
      steps.push({
        label: 'Step 2: Hours Freed',
        value: `${fn(totalTickets, 0)} × (${fn(timeSaved, 0)} ÷ 60) = ${fn(hoursFreed, 2)} hours`,
      })
      steps.push({
        label: 'Step 3: Annual Benefit',
        value: `${fn(hoursFreed, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // Change Management (special formula)
    else if (component.componentId === 'changeManagement') {
      const changes = inputs.numberOfChanges || 0
      const avgPctFailed = inputs.avgPercentFailedChanges || 0
      const pctReduction = inputs.percentReductionInFailedChanges || 0
      const timeSaved = inputs.timeSavedMinutes || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Changes × (% Failed ÷ 100) × (% Reduction ÷ 100) × (Mins Saved ÷ 60) × Hourly Rate`,
        description: 'Change management formula with failure rate and reduction',
      })
      steps.push({
        label: 'Inputs',
        value: `Changes: ${fn(changes, 0)} | % Failed: ${fp(avgPctFailed)} | % Reduction: ${fp(pctReduction)}`,
      })
      steps.push({
        label: 'More Inputs',
        value: `Time Saved: ${fn(timeSaved, 0)} mins | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const failedChangesReduced = changes * (avgPctFailed / 100) * (pctReduction / 100)
      const hoursFreed = failedChangesReduced * (timeSaved / 60)

      steps.push({
        label: 'Step 1: Failed Changes Reduced',
        value: `${fn(changes, 0)} × (${fp(avgPctFailed)} ÷ 100) × (${fp(pctReduction)} ÷ 100) = ${fn(failedChangesReduced, 2)} changes`,
      })
      steps.push({
        label: 'Step 2: Hours Freed',
        value: `${fn(failedChangesReduced, 2)} × (${fn(timeSaved, 0)} ÷ 60) = ${fn(hoursFreed, 2)} hours`,
      })
      steps.push({
        label: 'Step 3: Annual Benefit',
        value: `${fn(hoursFreed, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // Time-Based Productivity (Project Management, Asset Management, CMDB)
    else if (
      ['projectManagement', 'assetManagement', 'cmdb'].includes(component.componentId)
    ) {
      const timeToday = inputs.timeSpentTodayHours || 0
      const pctTimeSaved = inputs.percentTimeSaved || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Weekly Hours × 52 × (% Time Saved ÷ 100) × Hourly Rate`,
        description: 'Time-based productivity formula',
      })
      steps.push({
        label: 'Inputs',
        value: `Weekly Hours: ${fn(timeToday, 2)} | % Time Saved: ${fp(pctTimeSaved)} | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const annualHours = timeToday * 52
      const hoursSaved = annualHours * (pctTimeSaved / 100)

      steps.push({
        label: 'Step 1: Annual Hours',
        value: `${fn(timeToday, 2)} × 52 weeks = ${fn(annualHours, 2)} hours`,
      })
      steps.push({
        label: 'Step 2: Hours Saved',
        value: `${fn(annualHours, 2)} × (${fp(pctTimeSaved)} ÷ 100) = ${fn(hoursSaved, 2)} hours`,
      })
      steps.push({
        label: 'Step 3: Annual Benefit',
        value: `${fn(hoursSaved, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // License Consolidation
    else if (component.componentId === 'licenseConsolidation') {
      const tools = inputs.numberOfTools || 0
      const costPerTool = inputs.costPerTool || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Number of Tools × Cost Per Tool`,
        description: 'Simple cost savings from consolidating tools',
      })
      steps.push({
        label: 'Inputs',
        value: `Tools: ${fn(tools, 0)} | Cost Per Tool: ${fc(costPerTool)}`,
      })
      steps.push({
        label: 'Annual Benefit',
        value: `${fn(tools, 0)} × ${fc(costPerTool)} = ${fc(component.annualBenefit)}`,
      })
    }

    // Infrastructure Savings
    else if (component.componentId === 'infrastructureSavings') {
      const costBefore = inputs.costBefore || 0
      const costAfter = inputs.costAfter || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = MAX(0, Cost Before - Cost After)`,
        description: 'Infrastructure cost reduction',
      })
      steps.push({
        label: 'Inputs',
        value: `Cost Before: ${fc(costBefore)} | Cost After: ${fc(costAfter)}`,
      })
      steps.push({
        label: 'Annual Benefit',
        value: `MAX(0, ${fc(costBefore)} - ${fc(costAfter)}) = ${fc(component.annualBenefit)}`,
      })
    }

    // Vendor Spend Reduction
    else if (component.componentId === 'vendorSpendReduction') {
      const currentSpend = inputs.currentVendorSpend || 0
      const pctReduction = inputs.percentReduction || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Current Spend × (% Reduction ÷ 100)`,
        description: 'Vendor spend reduction',
      })
      steps.push({
        label: 'Inputs',
        value: `Current Spend: ${fc(currentSpend)} | % Reduction: ${fp(pctReduction)}`,
      })
      steps.push({
        label: 'Annual Benefit',
        value: `${fc(currentSpend)} × (${fp(pctReduction)} ÷ 100) = ${fc(component.annualBenefit)}`,
      })
    }

    // ESM Shared Services
    else if (component.componentId === 'esmSharedServices') {
      const hrBudget = inputs.hrBudget || 0
      const facilitiesBudget = inputs.facilitiesBudget || 0
      const legalBudget = inputs.legalBudget || 0
      const financeBudget = inputs.financeBudget || 0
      const totalBudget = hrBudget + facilitiesBudget + legalBudget + financeBudget
      const pctSaved = inputs.percentSaved || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Total ESM Budget × (% Saved ÷ 100)`,
        description: 'Aggregates budgets from HR, Facilities, Legal, and Finance',
      })
      steps.push({
        label: 'Inputs',
        value: `HR: ${fc(hrBudget)} | Facilities: ${fc(facilitiesBudget)} | Legal: ${fc(legalBudget)} | Finance: ${fc(financeBudget)}`,
      })
      steps.push({
        label: 'ESM Budget',
        value: `% Saved: ${fp(pctSaved)}`,
      })
      steps.push({
        label: 'Step 1: Total ESM Budget',
        value: `${fc(hrBudget)} + ${fc(facilitiesBudget)} + ${fc(legalBudget)} + ${fc(financeBudget)} = ${fc(totalBudget)}`,
      })
      steps.push({
        label: 'Step 2: Annual Benefit',
        value: `${fc(totalBudget)} × (${fp(pctSaved)} ÷ 100) = ${fc(component.annualBenefit)}`,
      })
    }

    // Freddy Copilot Savings
    else if (component.componentId === 'freddyCopilotSavings') {
      const interactions = inputs.numberOfInteractions || 0
      const pctHandled = inputs.percentHandledByCopilot || 0
      const timeSaved = inputs.timeSavedMinutes || 0

      steps.push({
        label: 'Formula',
        value: `Annual Benefit = Interactions × (% Handled ÷ 100) × (Mins Saved ÷ 60) × Hourly Rate`,
        description: 'Freddy Copilot productivity gains',
      })
      steps.push({
        label: 'Inputs',
        value: `Interactions: ${fn(interactions, 0)} | % Handled: ${fp(pctHandled)} | Time Saved: ${fn(timeSaved, 0)} mins | Hourly Rate: ${fc(hourlyRate)}`,
      })

      const interactionsAssisted = interactions * (pctHandled / 100)
      const hoursFreed = interactionsAssisted * (timeSaved / 60)

      steps.push({
        label: 'Step 1: Interactions Assisted',
        value: `${fn(interactions, 0)} × (${fp(pctHandled)} ÷ 100) = ${fn(interactionsAssisted, 2)} interactions`,
      })
      steps.push({
        label: 'Step 2: Hours Freed',
        value: `${fn(interactionsAssisted, 2)} × (${fn(timeSaved, 0)} ÷ 60) = ${fn(hoursFreed, 2)} hours`,
      })
      steps.push({
        label: 'Step 3: Annual Benefit',
        value: `${fn(hoursFreed, 2)} × ${fc(hourlyRate)} = ${fc(component.annualBenefit)}`,
      })
    }

    // Generic fallback
    else {
      steps.push({
        label: 'Annual Benefit',
        value: fc(component.annualBenefit),
        description: 'Detailed breakdown not available for this component',
      })
    }

    return steps
  }

  return (
    <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-xs overflow-auto max-h-[800px]">
      <h3 className="text-sm font-bold mb-4 text-yellow-400">
        ═══════════════════════════════════════════════════════
      </h3>
      <h3 className="text-sm font-bold mb-4 text-yellow-400 text-center">
        CALCULATION TRACE - ROI CALCULATOR DEBUG MODE
      </h3>
      <h3 className="text-sm font-bold mb-6 text-yellow-400">
        ═══════════════════════════════════════════════════════
      </h3>

      {/* [1] Configuration Overview */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[1] CONFIGURATION OVERVIEW</h4>
        <div className="ml-4 space-y-1">
          <div>
            <span className="text-gray-400">Agent Count:</span>{' '}
            <span className="text-white">{fn(agentData.agentCount || 0, 0)}</span>
          </div>
          <div>
            <span className="text-gray-400">Individual Agent Expense:</span>{' '}
            <span className="text-white">{fc(agentData.individualAgentExpense || 0)}</span>
          </div>
          <div>
            <span className="text-gray-400">Calculated Hourly Rate:</span>{' '}
            <span className="text-white">{fc(hourlyRate)}</span>
            <span className="text-gray-500"> (Annual Expense ÷ 2,080 hours)</span>
          </div>
          <div className="mt-2">
            <span className="text-gray-400">Selected Plan:</span>{' '}
            <span className="text-white">{opportunity.plan || 'Not selected'}</span>
          </div>
          <div>
            <span className="text-gray-400">ESM Enabled:</span>{' '}
            <span className="text-white">{opportunity.esm ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-gray-400">Freddy Enabled:</span>{' '}
            <span className="text-white">{opportunity.freddyCoPilot ? 'Yes' : 'No'}</span>
          </div>
          <div className="mt-2">
            <span className="text-gray-400">Discount Rate:</span>{' '}
            <span className="text-white">{fp(discountRate)}</span>
          </div>
          <div>
            <span className="text-gray-400">Benefit Realization Factors:</span>
          </div>
          <div className="ml-4">
            <span className="text-gray-500">Year 1: {fp(benefitRealizationFactors.year1 * 100)}</span>
            <span className="text-gray-500 ml-4">
              Year 2: {fp(benefitRealizationFactors.year2 * 100)}
            </span>
            <span className="text-gray-500 ml-4">
              Year 3: {fp(benefitRealizationFactors.year3 * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* [1A] INPUT DATA VALIDATION */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[1A] INPUT DATA VALIDATION</h4>
        <div className="ml-4 space-y-1">
          {validationIssues.map((issue, index) => (
            <div key={index} className="flex items-start">
              {issue.type === 'success' && <span className="text-green-400 mr-2">✓</span>}
              {issue.type === 'warning' && <span className="text-yellow-400 mr-2">⚠</span>}
              {issue.type === 'error' && <span className="text-red-400 mr-2">✗</span>}
              <span
                className={
                  issue.type === 'success'
                    ? 'text-green-300'
                    : issue.type === 'warning'
                    ? 'text-yellow-300'
                    : 'text-red-300'
                }
              >
                {issue.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* [1B] COMPONENT ENABLEMENT STATUS */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">
          [1B] COMPONENT ENABLEMENT STATUS ({componentStatus.enabledCount} of {componentStatus.total} enabled)
        </h4>

        {/* Enabled Components */}
        <div className="ml-4 mb-3">
          <div className="text-green-400 font-bold mb-1">Enabled ({componentStatus.enabledCount}):</div>
          <div className="ml-4 space-y-1">
            {componentStatus.enabled.map((comp) => (
              <div key={comp.id}>
                <span className="text-green-300">✓</span>{' '}
                <span className="text-white">{comp.name}</span>
                <span className="text-gray-500"> - {comp.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disabled Components */}
        {componentStatus.disabled.length > 0 && (
          <div className="ml-4">
            <div className="text-red-400 font-bold mb-1">
              Disabled ({componentStatus.disabled.length}):
            </div>
            <div className="ml-4 space-y-1">
              {componentStatus.disabled.map((comp) => {
                let reason = 'Component not selected'
                if (comp.requiresESM && !opportunity.esm) reason = 'ESM not enabled'
                if (comp.requiresFreddy && !opportunity.freddyCoPilot) reason = 'Freddy Co-Pilot not enabled'
                if (!comp.visibleForPlans.includes(opportunity.plan || 'Growth')) reason = `Not available for ${opportunity.plan} plan`

                return (
                  <div key={comp.id}>
                    <span className="text-red-300">✗</span>{' '}
                    <span className="text-gray-400">{comp.name}</span>
                    <span className="text-gray-600"> - {comp.category}</span>
                    <span className="text-yellow-500"> (Reason: {reason})</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* [1C] ENHANCED PRICING BREAKDOWN */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[1C] ENHANCED PRICING BREAKDOWN</h4>
        <div className="ml-4 space-y-2">
          {/* Base License */}
          <div className="border-l-2 border-gray-700 pl-4">
            <div className="text-yellow-400 font-bold">Base License Pricing:</div>
            <div className="ml-4 space-y-1">
              <div>
                <span className="text-gray-400">Base Price per Agent:</span>{' '}
                <span className="text-white">{fc((pricing.unitPrice || 0) - (opportunity.freddyCoPilot ? FREDDY_COPILOT_PRICE_PER_AGENT : 0))}/year</span>
              </div>
              {opportunity.freddyCoPilot && (
                <div>
                  <span className="text-gray-400">+ Freddy Co-Pilot:</span>{' '}
                  <span className="text-white">+{fc(FREDDY_COPILOT_PRICE_PER_AGENT)}/agent/year</span>
                  <span className="text-gray-500"> ($29/month × 12)</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-1 mt-1">
                <span className="text-green-400 font-bold">= Total Price per Agent:</span>{' '}
                <span className="text-white font-bold">{fc(pricing.unitPrice || 0)}/year</span>
              </div>
            </div>
          </div>

          {/* Annual License Calculation */}
          <div className="border-l-2 border-gray-700 pl-4">
            <div className="text-yellow-400 font-bold">Annual License Calculation:</div>
            <div className="ml-4">
              <div>
                <span className="text-gray-400">Formula:</span>{' '}
                <span className="text-white">{fc(pricing.unitPrice || 0)} × {fn(agentData.agentCount || 0, 0)} agents</span>
              </div>
              <div className="mt-1">
                <span className="text-green-400 font-bold">= Annual License Cost:</span>{' '}
                <span className="text-white font-bold">{fc((pricing.unitPrice || 0) * (agentData.agentCount || 0))}</span>
              </div>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="border-l-2 border-gray-700 pl-4">
            <div className="text-yellow-400 font-bold">Additional Costs:</div>
            <div className="ml-4 space-y-1">
              <div>
                <span className="text-gray-400">Implementation (Year 1 only):</span>{' '}
                <span className="text-white">{fc(pricing.implementationPrice || 0)}</span>
              </div>
              {pricing.premiumSupportPrice && pricing.premiumSupportPrice > 0 && (
                <div>
                  <span className="text-gray-400">Premium Support (annual):</span>{' '}
                  <span className="text-white">{fc(pricing.premiumSupportPrice)}</span>
                </div>
              )}
              {pricing.otherCosts && pricing.otherCosts > 0 && (
                <div>
                  <span className="text-gray-400">Other Costs (annual):</span>{' '}
                  <span className="text-white">{fc(pricing.otherCosts)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Year-by-Year Costs */}
          <div className="border-l-2 border-green-700 pl-4 bg-gray-800 p-3 rounded">
            <div className="text-green-400 font-bold">Year-by-Year Cost Summary:</div>
            <div className="ml-4 space-y-1">
              {yearlyData.map((year) => (
                <div key={year.year}>
                  <span className="text-gray-400">Year {year.year}:</span>{' '}
                  <span className="text-white font-bold">{fc(year.costs)}</span>
                  {year.year === 1 && <span className="text-gray-500"> (includes implementation)</span>}
                </div>
              ))}
              <div className="border-t border-green-700 pt-1 mt-2">
                <span className="text-green-400 font-bold">Total 3-Year Cost:</span>{' '}
                <span className="text-white font-bold">{fc(analysisResults.totalCosts3yr)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* [1D] MATURITY IMPACT ANALYSIS */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[1D] MATURITY IMPACT ANALYSIS</h4>
        <div className="ml-4 space-y-3">
          {componentResults
            .filter((c) => {
              const config = getComponentById(c.componentId)
              return config?.supportsMaturity
            })
            .map((component) => {
              const impact = getMaturityImpact(component.componentId)
              if (!impact) return null

              return (
                <div key={component.componentId} className="border-l-2 border-purple-700 pl-4">
                  <div className="text-yellow-400 font-bold">{impact.componentName}</div>
                  <div className="ml-4 space-y-1">
                    <div>
                      <span className="text-gray-400">Selected:</span>{' '}
                      <span className="text-white">
                        {impact.selectedLevel === 'Other'
                          ? `Custom (${impact.customPercentage}%)`
                          : impact.selectedLevel || 'Not set'}
                      </span>
                      {' '}→{' '}
                      <span className="text-green-300 font-bold">Annual Benefit: {fc(impact.actualBenefit)}</span>
                    </div>

                    {impact.maturityDefaults && (
                      <div className="mt-2">
                        <div className="text-cyan-300 text-xs">Alternative Maturity Levels:</div>
                        <div className="ml-4 space-y-0.5 text-xs">
                          {impact.maturityDefaults.low !== undefined && (
                            <div className="text-gray-400">
                              Low ({impact.maturityDefaults.low.percentEliminated ?? impact.maturityDefaults.low.timeSavedMinutes ?? '—'}{impact.maturityDefaults.low.percentEliminated !== undefined ? '%' : ' mins'}) - Would yield different benefit
                            </div>
                          )}
                          {impact.maturityDefaults.medium !== undefined && (
                            <div className="text-gray-400">
                              Medium ({impact.maturityDefaults.medium.percentEliminated ?? impact.maturityDefaults.medium.timeSavedMinutes ?? '—'}{impact.maturityDefaults.medium.percentEliminated !== undefined ? '%' : ' mins'}) - Would yield different benefit
                            </div>
                          )}
                          {impact.maturityDefaults.high !== undefined && (
                            <div className="text-gray-400">
                              High ({impact.maturityDefaults.high.percentEliminated ?? impact.maturityDefaults.high.timeSavedMinutes ?? '—'}{impact.maturityDefaults.high.percentEliminated !== undefined ? '%' : ' mins'}) - Would yield different benefit
                            </div>
                          )}
                          {impact.otherRange && (
                            <div className="text-gray-400">
                              Custom range: {impact.otherRange.min}% - {impact.otherRange.max}%
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* [2] Component Calculations */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">
          [2] COMPONENT CALCULATIONS ({componentResults.length} enabled)
        </h4>
        <div className="space-y-4">
          {componentResults.map((component, index) => {
            const steps = getCalculationSteps(component)
            return (
              <div key={component.componentId} className="ml-4 border-l-2 border-gray-700 pl-4">
                <div className="mb-2">
                  <span className="text-yellow-400 font-bold">
                    [{index + 1}] {component.componentName}
                  </span>
                  <span className="text-gray-500 ml-2">({component.category})</span>
                </div>

                {steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="ml-4 mb-1">
                    {step.label === 'Formula' ? (
                      <>
                        <div className="text-yellow-300">{step.label}:</div>
                        <div className="ml-4 text-white">{step.value}</div>
                        {step.description && (
                          <div className="ml-4 text-gray-500 italic">{step.description}</div>
                        )}
                      </>
                    ) : step.label.startsWith('Step') ? (
                      <div>
                        <span className="text-green-300">{step.label}:</span>{' '}
                        <span className="text-white">{step.value}</span>
                      </div>
                    ) : step.label === 'Annual Benefit' ? (
                      <div className="mt-1">
                        <span className="text-green-400 font-bold">→ {step.label}:</span>{' '}
                        <span className="text-white font-bold">{step.value}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-cyan-300">{step.label}:</span>{' '}
                        <span className="text-white">{step.value}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* 3-Year Projection */}
                <div className="ml-4 mt-2">
                  <div className="text-magenta-400">3-Year Projection (with realization factors):</div>
                  <div className="ml-4">
                    <div>
                      <span className="text-gray-400">Year 1 ({fp(benefitRealizationFactors.year1 * 100)}):</span>{' '}
                      <span className="text-white">{fc(component.year1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Year 2 ({fp(benefitRealizationFactors.year2 * 100)}):</span>{' '}
                      <span className="text-white">{fc(component.year2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Year 3 ({fp(benefitRealizationFactors.year3 * 100)}):</span>{' '}
                      <span className="text-white">{fc(component.year3)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-green-400 font-bold">Total 3-Year:</span>{' '}
                      <span className="text-white font-bold">{fc(component.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* [3] Cost Breakdown */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[3] COST BREAKDOWN</h4>
        <div className="ml-4 space-y-2">
          <div>
            <span className="text-gray-400">Unit Price:</span>{' '}
            <span className="text-white">{fc(pricing.unitPrice || 0)}</span>
          </div>
          <div>
            <span className="text-gray-400">Agent Count:</span>{' '}
            <span className="text-white">{fn(agentData.agentCount || 0, 0)}</span>
          </div>
          <div>
            <span className="text-gray-400">Implementation Cost (one-time, Year 1):</span>{' '}
            <span className="text-white">{fc(pricing.implementationPrice || 0)}</span>
          </div>

          <div className="mt-3 border-t border-gray-700 pt-2">
            <div className="text-yellow-300">Costs by Year:</div>
            <div className="ml-4">
              {yearlyData.map((year) => (
                <div key={year.year}>
                  <span className="text-gray-400">Year {year.year}:</span>{' '}
                  <span className="text-white">{fc(year.costs)}</span>
                  {year.year === 1 && <span className="text-gray-500"> (includes implementation)</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* [4] Yearly Cash Flow */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[4] YEARLY CASH FLOW</h4>
        <div className="ml-4 space-y-3">
          {yearlyData.map((year) => (
            <div key={year.year} className="border-l-2 border-gray-700 pl-4">
              <div className="text-yellow-400 font-bold">Year {year.year}</div>
              <div className="ml-4">
                <div>
                  <span className="text-gray-400">Total Benefits:</span>{' '}
                  <span className="text-green-300">{fc(year.benefits)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Costs:</span>{' '}
                  <span className="text-red-300">{fc(year.costs)}</span>
                </div>
                <div className="mt-1">
                  <span className="text-cyan-400 font-bold">Net Cash Flow:</span>{' '}
                  <span className="text-white font-bold">{fc(year.netCashFlow)}</span>
                  <span className="text-gray-500"> (Benefits - Costs)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* [5] Final Metrics Calculations */}
      <div className="mb-6">
        <h4 className="text-cyan-400 font-bold mb-2">[5] FINAL METRICS CALCULATIONS</h4>
        <div className="ml-4 space-y-3">
          {/* ROI */}
          <div className="border-l-2 border-gray-700 pl-4">
            <div className="text-yellow-400 font-bold">Return on Investment (ROI)</div>
            <div className="ml-4">
              <div className="text-yellow-300">
                Formula: ROI = (Total Net Cash Flow ÷ Total Costs) × 100
              </div>
              <div className="mt-1">
                <span className="text-gray-400">Total Benefits (3-Year):</span>{' '}
                <span className="text-white">{fc(analysisResults.totalBenefits3yr)}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Costs (3-Year):</span>{' '}
                <span className="text-white">{fc(analysisResults.totalCosts3yr)}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Net Cash Flow:</span>{' '}
                <span className="text-white">{fc(analysisResults.totalBenefits3yr - analysisResults.totalCosts3yr)}</span>
              </div>
              <div className="mt-1">
                <span className="text-green-300">Calculation:</span>{' '}
                <span className="text-white">
                  ({fc(analysisResults.totalBenefits3yr - analysisResults.totalCosts3yr)} ÷ {fc(analysisResults.totalCosts3yr)}) × 100
                </span>
              </div>
              <div className="mt-1">
                <span className="text-green-400 font-bold text-base">
                  → ROI = {fp(analysisResults.roi)}
                </span>
              </div>
            </div>
          </div>

          {/* Payback Period */}
          <div className="border-l-2 border-gray-700 pl-4">
            <div className="text-yellow-400 font-bold">Payback Period</div>
            <div className="ml-4">
              <div className="text-yellow-300">
                Formula: Payback = (Total Costs ÷ Year 1 Benefits) × 12 months
              </div>
              <div className="mt-1">
                <span className="text-gray-400">Total Costs (3-Year):</span>{' '}
                <span className="text-white">{fc(analysisResults.totalCosts3yr)}</span>
              </div>
              <div>
                <span className="text-gray-400">Year 1 Benefits:</span>{' '}
                <span className="text-white">{fc(yearlyData[0]?.benefits || 0)}</span>
              </div>
              <div className="mt-1">
                <span className="text-green-300">Calculation:</span>{' '}
                <span className="text-white">
                  ({fc(analysisResults.totalCosts3yr)} ÷ {fc(yearlyData[0]?.benefits || 0)}) × 12
                </span>
              </div>
              <div className="mt-1">
                <span className="text-green-400 font-bold text-base">
                  → Payback Period = {fn(analysisResults.paybackPeriod, 1)} months
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-l-2 border-green-500 pl-4 bg-gray-800 p-3 rounded">
            <div className="text-green-400 font-bold text-sm">SUMMARY</div>
            <div className="ml-4 mt-2 space-y-1">
              <div>
                <span className="text-gray-400">Total 3-Year Benefits:</span>{' '}
                <span className="text-green-300 font-bold">
                  {fc(analysisResults.totalBenefits3yr)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Total 3-Year Costs:</span>{' '}
                <span className="text-red-300 font-bold">{fc(analysisResults.totalCosts3yr)}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Net Cash Flow:</span>{' '}
                <span className="text-cyan-300 font-bold">
                  {fc(analysisResults.totalBenefits3yr - analysisResults.totalCosts3yr)}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-600">
                <span className="text-yellow-400 font-bold">ROI:</span>{' '}
                <span className="text-white font-bold text-base">{fp(analysisResults.roi)}</span>
              </div>
              <div>
                <span className="text-yellow-400 font-bold">Payback Period:</span>{' '}
                <span className="text-white font-bold text-base">
                  {fn(analysisResults.paybackPeriod, 1)} months
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* [6] Raw Data */}
      <div className="mb-4">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-2"
        >
          <span>{showRawData ? '▼' : '▶'}</span>
          <span>[6] RAW DATA (click to {showRawData ? 'collapse' : 'expand'})</span>
        </button>
        {showRawData && (
          <div className="ml-4 mt-2">
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ state, calculatedResults }, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="text-center text-gray-500 text-xs mt-6 pt-4 border-t border-gray-700">
        End of Calculation Trace
      </div>
    </div>
  )
}
