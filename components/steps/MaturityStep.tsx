'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWizard } from '@/contexts/WizardContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Radio from '@/components/ui/Radio'
import { MaturityLevel, MaturityArea } from '@/types'
import { getMaturityAreasForPlan } from '@/lib/data'
import { calculateROIResults } from '@/lib/calculationEngine'
import { getVisibleComponents } from '@/lib/controlPanel'

export default function MaturityStep() {
  const { state, updateMaturity, updateResults, nextStep, previousStep } = useWizard()
  const { opportunity, agentData, pricing } = state

  const availableAreas = useMemo(
    () => (opportunity.plan ? getMaturityAreasForPlan(opportunity.plan) : []),
    [opportunity.plan]
  )

  // Initialize maturity state
  const [maturityValues, setMaturityValues] = useState<Record<string, {
    level: MaturityLevel
    customPercentage?: number
    customTimeSaved?: number
  }>>({})

  // Load existing values
  useEffect(() => {
    if (state.maturity && Object.keys(state.maturity).length > 0) {
      const loaded: Record<string, { level: MaturityLevel; customPercentage?: number; customTimeSaved?: number }> = {}
      availableAreas.forEach(area => {
        const existingArea = (state.maturity as any)[area.name] as MaturityArea | undefined
        if (existingArea) {
          loaded[area.name] = {
            level: existingArea.level,
            customPercentage: existingArea.customPercentage,
            customTimeSaved: existingArea.customTimeSaved,
          }
        }
      })
      setMaturityValues(loaded)
    }
  }, [availableAreas, state.maturity])

  const handleLevelChange = (areaName: string, level: MaturityLevel) => {
    const area = availableAreas.find(a => a.name === areaName)
    setMaturityValues(prev => ({
      ...prev,
      [areaName]: {
        level,
        customPercentage: level === 'Other' ? prev[areaName]?.customPercentage || 0 : undefined,
        customTimeSaved: level === 'Other' && area?.timeSavedRange
          ? prev[areaName]?.customTimeSaved || area.timeSavedRange.default
          : undefined,
      },
    }))
  }

  const handleCustomPercentageChange = (areaName: string, value: string) => {
    const numValue = parseFloat(value)
    setMaturityValues(prev => ({
      ...prev,
      [areaName]: {
        ...prev[areaName],
        level: 'Other',
        customPercentage: numValue,
      },
    }))
  }

  const handleCustomTimeSavedChange = (areaName: string, value: string) => {
    const numValue = parseFloat(value)
    setMaturityValues(prev => ({
      ...prev,
      [areaName]: {
        ...prev[areaName],
        level: 'Other',
        customTimeSaved: numValue,
      },
    }))
  }

  const getPercentageForLevel = (area: any, level: MaturityLevel): number => {
    switch (level) {
      case 'Low':
        return area.defaultPercentages.low
      case 'Medium':
        return area.defaultPercentages.medium
      case 'High':
        return area.defaultPercentages.high
      default:
        return 0
    }
  }

  const isCustomPercentageValid = (areaName: string): boolean => {
    const area = availableAreas.find(a => a.name === areaName)
    const value = maturityValues[areaName]
    if (!area || value?.level !== 'Other' || value.customPercentage === undefined) {
      return true
    }
    return (
      value.customPercentage >= area.otherRange.min &&
      value.customPercentage <= area.otherRange.max
    )
  }

  const isCustomTimeSavedValid = (areaName: string): boolean => {
    const area = availableAreas.find(a => a.name === areaName)
    const value = maturityValues[areaName]
    if (!area || !area.timeSavedRange || value?.level !== 'Other' || value.customTimeSaved === undefined) {
      return true
    }
    return (
      value.customTimeSaved >= area.timeSavedRange.min &&
      value.customTimeSaved <= area.timeSavedRange.max
    )
  }

  const handleContinue = () => {
    // Validate all areas have a selection
    const missingAreas = availableAreas.filter(area => !maturityValues[area.name]?.level)
    if (missingAreas.length > 0) {
      alert('Please select a maturity level for all areas')
      return
    }

    // Validate custom percentages
    const invalidCustom = availableAreas.filter(
      area => !isCustomPercentageValid(area.name)
    )
    if (invalidCustom.length > 0) {
      alert('Please ensure all custom percentages are within the valid range')
      return
    }

    // Validate custom time saved
    const invalidTimeSaved = availableAreas.filter(
      area => !isCustomTimeSavedValid(area.name)
    )
    if (invalidTimeSaved.length > 0) {
      alert('Please ensure all custom time saved values are within the valid range')
      return
    }

    // Build maturity data
    const maturityData: any = {}
    availableAreas.forEach(area => {
      const value = maturityValues[area.name]
      maturityData[area.name] = {
        name: area.label,
        level: value.level,
        customPercentage: value.customPercentage,
        customTimeSaved: value.customTimeSaved,
        defaultPercentages: area.defaultPercentages,
        otherRange: area.otherRange,
        timeSavedRange: area.timeSavedRange,
      } as MaturityArea
    })

    updateMaturity(maturityData)

    // Calculate results using new calculation engine
    try {
      // Calculate hourly rate
      const hourlyRate = (agentData.individualAgentExpense || 0) / 2080

      // Get visible components based on opportunity configuration
      const visibleComponents = getVisibleComponents(
        opportunity.plan || '',
        opportunity.esm || false,
        opportunity.freddyCoPilot || false
      )

      // Build component data from maturity selections
      const componentData: any = {}
      const totalTickets = (agentData.annualIncidents || 0) + (agentData.annualServiceRequests || 0)

      visibleComponents.forEach((component) => {
        const maturityArea = maturityData[component.id]
        if (!maturityArea) return

        // Get the percentage for this maturity level
        const maturityValue = maturityValues[component.id]
        let percentage = 0

        if (maturityValue?.level === 'Other' && maturityValue.customPercentage !== undefined) {
          percentage = maturityValue.customPercentage
        } else if (component.maturityDefaults) {
          const defaults = component.maturityDefaults
          switch (maturityValue?.level) {
            case 'Low':
              percentage = defaults.low?.percentEliminated || defaults.low?.timeSavedMinutes || defaults.low?.percentTimeSaved || 0
              break
            case 'Medium':
              percentage = defaults.medium?.percentEliminated || defaults.medium?.timeSavedMinutes || defaults.medium?.percentTimeSaved || 0
              break
            case 'High':
              percentage = defaults.high?.percentEliminated || defaults.high?.timeSavedMinutes || defaults.high?.percentTimeSaved || 0
              break
          }
        }

        // Build inputs based on component type
        const inputs: any = {}

        // Ticket elimination components
        if (component.id === 'knowledgeBase') {
          inputs.numberOfTickets = totalTickets
          inputs.percentEliminated = percentage
          inputs.timeSavedMinutes = maturityValue?.level === 'Other' && maturityValue.customTimeSaved !== undefined
            ? maturityValue.customTimeSaved
            : (component.maturityDefaults?.low?.timeSavedMinutes || 5)
        } else if (component.id === 'automationServiceRequests') {
          inputs.numberOfTickets = agentData.annualServiceRequests || 0
          inputs.percentEliminated = percentage
          inputs.timeSavedMinutes = maturityValue?.level === 'Other' && maturityValue.customTimeSaved !== undefined
            ? maturityValue.customTimeSaved
            : (component.maturityDefaults?.low?.timeSavedMinutes || 10)
        } else if (component.id === 'freddyAIAgent') {
          inputs.numberOfTickets = totalTickets
          inputs.percentEliminated = percentage
          inputs.timeSavedMinutes = maturityValue?.level === 'Other' && maturityValue.customTimeSaved !== undefined
            ? maturityValue.customTimeSaved
            : (component.maturityDefaults?.low?.timeSavedMinutes || 12)
        } else if (component.id === 'proactiveProblemManagement') {
          inputs.numberOfTickets = agentData.annualIncidents || 0
          inputs.percentEliminated = percentage
          inputs.timeSavedMinutes = maturityValue?.level === 'Other' && maturityValue.customTimeSaved !== undefined
            ? maturityValue.customTimeSaved
            : (component.maturityDefaults?.low?.timeSavedMinutes || 30)
        } else if (component.id === 'esmTicketElimination') {
          // Use default ESM ticket volumes
          inputs.hrTickets = 5000
          inputs.facilitiesTickets = 3000
          inputs.legalTickets = 1000
          inputs.financeTickets = 2000
          inputs.percentEliminated = percentage
          inputs.timeSavedMinutes = maturityValue?.level === 'Other' && maturityValue.customTimeSaved !== undefined
            ? maturityValue.customTimeSaved
            : (component.maturityDefaults?.low?.timeSavedMinutes || 8)
        }
        // Agent productivity components
        else if (component.id === 'incidentManagement') {
          inputs.ticketsRemaining = agentData.annualIncidents || 0
          inputs.timeSavedMinutes = percentage
        } else if (component.id === 'serviceRequestManagement') {
          inputs.requestsRemaining = agentData.annualServiceRequests || 0
          inputs.timeSavedMinutes = percentage
        } else if (component.id === 'problemManagement') {
          inputs.numberOfProblems = 50
          inputs.timeSavedMinutes = percentage
        } else if (component.id === 'changeManagement') {
          const defaults = component.maturityDefaults?.[maturityValue?.level.toLowerCase() as 'low' | 'medium' | 'high']
          inputs.numberOfChanges = 500
          inputs.avgPercentFailedChanges = defaults?.avgPercentFailedChanges || 15
          inputs.percentReductionInFailedChanges = defaults?.percentReductionInFailedChanges || 20
          inputs.timeSavedMinutes = defaults?.timeSavedMinutes || 45
        } else if (component.id === 'projectManagement') {
          inputs.timeSpentTodayHours = 20
          inputs.percentTimeSaved = percentage
        } else if (component.id === 'assetManagement') {
          inputs.timeSpentTodayHours = 15
          inputs.percentTimeSaved = percentage
        } else if (component.id === 'cmdb') {
          inputs.timeSpentTodayHours = 10
          inputs.percentTimeSaved = percentage
        } else if (component.id === 'serviceCatalogExpansion') {
          inputs.additionalCatalogRequests = 5000
          inputs.timeSavedMinutes = percentage
        } else if (component.id === 'esmAgentProductivity') {
          inputs.hrTicketsRemaining = 4000
          inputs.facilitiesTicketsRemaining = 2500
          inputs.legalTicketsRemaining = 800
          inputs.financeTicketsRemaining = 1600
          inputs.timeSavedMinutes = percentage
        }
        // Cost savings components (using default values since no maturity)
        else if (component.id === 'licenseConsolidation') {
          inputs.numberOfToolsEliminated = 3
          inputs.costPerToolEliminated = 10000
        } else if (component.id === 'infrastructureSavings') {
          inputs.annualInfraCostBefore = 50000
          inputs.annualInfraCostAfter = 10000
        } else if (component.id === 'vendorSpendReduction') {
          inputs.currentVendorSpend = 200000
          inputs.percentReduction = 20
        } else if (component.id === 'esmSharedServices') {
          inputs.hrBudget = 500000
          inputs.facilitiesBudget = 300000
          inputs.legalBudget = 200000
          inputs.financeBudget = 400000
          inputs.percentSaved = 15
        } else if (component.id === 'freddyCopilotSavings') {
          inputs.numberOfInteractions = totalTickets
          inputs.percentHandledByAI = percentage
          inputs.timeSavedMinutes = component.maturityDefaults?.low?.timeSavedMinutes || 3
        }

        componentData[component.id] = {
          inputs,
          enabled: true,
        }
      })

      // Calculate costs
      const agentCount = agentData.agentCount || 0
      const unitPrice = pricing.unitPrice || 0
      const implementationPrice = pricing.implementationPrice || 0

      const costs = {
        year1License: unitPrice * agentCount,
        year2License: unitPrice * agentCount,
        year3License: unitPrice * agentCount,
        year1Freddy: 0,
        year2Freddy: 0,
        year3Freddy: 0,
        implementation: implementationPrice,
      }

      // Call new calculation engine
      const results = calculateROIResults({
        hourlyRate,
        componentData,
        costs,
        benefitRealizationFactors: state.advancedConfig?.benefitRealizationFactors || {
          year1: 0.5,
          year2: 0.75,
          year3: 1.0,
        },
        discountRate: state.advancedConfig?.discountRate || 10,
      })

      updateResults(results)
      nextStep()
    } catch (error) {
      console.error('Error calculating results:', error)
      alert('An error occurred while calculating results. Please check your inputs and try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Maturity Assessment</h2>
        <p className="text-gray-600">
          Assess your organization&apos;s maturity in various areas to calculate potential benefits.
        </p>
      </div>

      {availableAreas.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-gray-700">
            No maturity areas are available for the selected plan. Please go back and verify your
            plan selection.
          </p>
        </div>
      )}

      {availableAreas.map((area, index) => {
        const currentValue = maturityValues[area.name]
        const isOtherSelected = currentValue?.level === 'Other'
        const customValue = currentValue?.customPercentage

        return (
          <div
            key={area.name}
            className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:border-primary-300 transition-colors"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{area.label}</h3>
              <p className="text-sm text-gray-600">{area.description}</p>
            </div>

            <div className="space-y-3">
              {/* Low */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <Radio
                  name={`maturity-${area.name}`}
                  value="Low"
                  label={`Low (${getPercentageForLevel(area, 'Low')}% ticket elimination/deflection)`}
                  checked={currentValue?.level === 'Low'}
                  onChange={() => handleLevelChange(area.name, 'Low')}
                />
              </div>

              {/* Medium */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <Radio
                  name={`maturity-${area.name}`}
                  value="Medium"
                  label={`Medium (${getPercentageForLevel(area, 'Medium')}% ticket elimination/deflection)`}
                  checked={currentValue?.level === 'Medium'}
                  onChange={() => handleLevelChange(area.name, 'Medium')}
                />
              </div>

              {/* High */}
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <Radio
                  name={`maturity-${area.name}`}
                  value="High"
                  label={`High (${getPercentageForLevel(area, 'High')}% ticket elimination/deflection)`}
                  checked={currentValue?.level === 'High'}
                  onChange={() => handleLevelChange(area.name, 'High')}
                />
              </div>

              {/* Other */}
              <div className="p-3 rounded-lg hover:bg-gray-50">
                <Radio
                  name={`maturity-${area.name}`}
                  value="Other"
                  label="Other (Custom percentage)"
                  checked={isOtherSelected}
                  onChange={() => handleLevelChange(area.name, 'Other')}
                />
                {isOtherSelected && (
                  <div className="mt-3 ml-6 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        % Tickets Eliminated
                      </label>
                      <Input
                        type="number"
                        value={customValue?.toString() || ''}
                        onChange={(e) =>
                          handleCustomPercentageChange(area.name, e.target.value)
                        }
                        placeholder={`Enter percentage (${area.otherRange.min}-${area.otherRange.max}%)`}
                        min={area.otherRange.min}
                        max={area.otherRange.max}
                        step="0.1"
                        error={
                          customValue !== undefined && !isCustomPercentageValid(area.name)
                            ? `Must be between ${area.otherRange.min}% and ${area.otherRange.max}%`
                            : undefined
                        }
                      />
                    </div>
                    {area.timeSavedRange && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Saved per Ticket (minutes)
                        </label>
                        <Input
                          type="number"
                          value={currentValue?.customTimeSaved?.toString() || area.timeSavedRange.default.toString()}
                          onChange={(e) =>
                            handleCustomTimeSavedChange(area.name, e.target.value)
                          }
                          placeholder={`Enter minutes (${area.timeSavedRange.min}-${area.timeSavedRange.max})`}
                          min={area.timeSavedRange.min}
                          max={area.timeSavedRange.max}
                          step="0.5"
                          error={
                            currentValue?.customTimeSaved !== undefined && !isCustomTimeSavedValid(area.name)
                              ? `Must be between ${area.timeSavedRange.min} and ${area.timeSavedRange.max} minutes`
                              : undefined
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={previousStep} variant="outline" size="lg">
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={availableAreas.length === 0}
          size="lg"
        >
          Calculate Results
        </Button>
      </div>
    </div>
  )
}
