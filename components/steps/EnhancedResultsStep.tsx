'use client'

import { useState } from 'react'
import { useWizard } from '@/contexts/WizardContext'
import Button from '@/components/ui/Button'
import { CURRENCY_SYMBOLS, ComponentResult, ResultsData } from '@/types'
import { formatCurrency, formatPercentage, formatMonths } from '@/lib/calculations'
import { checkROIExportThreshold, checkExportReadiness } from '@/lib/guardrails'
import { calculateROIResults, type CalculationInputs } from '@/lib/calculationEngine'
import { getVisibleComponents } from '@/lib/controlPanel'
import { generatePDFReport } from '@/lib/pdfExport'
import CalculationTrace from '@/components/debug/CalculationTrace'

export default function EnhancedResultsStep() {
  const { state, previousStep, resetWizard } = useWizard()
  const { results, opportunity, agentData, pricing, advancedConfig } = state

  const [showDebugMode, setShowDebugMode] = useState(advancedConfig.debugModeEnabled || false)

  const currencySymbol = opportunity.localCurrency
    ? CURRENCY_SYMBOLS[opportunity.localCurrency]
    : '$'

  // Calculate results using new engine (demo mode with sample data)
  const defaultResults: ResultsData = {
    componentResults: [],
    yearlyData: [],
    analysisResults: {
      roi: 0,
      paybackPeriod: 0,
      npv: 0,
      irr: 0,
      totalBenefits3yr: 0,
      totalCosts3yr: 0,
      totalNetCashFlow3yr: 0,
    },
    discountRate: advancedConfig?.discountRate || 10,
    benefitRealizationFactors: advancedConfig?.benefitRealizationFactors || {
      year1: 0.5,
      year2: 0.75,
      year3: 1.0,
    },
  }

  const calculatedResults: ResultsData = {
    componentResults: results.componentResults || defaultResults.componentResults,
    yearlyData: results.yearlyData || defaultResults.yearlyData,
    analysisResults: results.analysisResults || defaultResults.analysisResults,
    discountRate: results.discountRate ?? defaultResults.discountRate,
    benefitRealizationFactors: results.benefitRealizationFactors || defaultResults.benefitRealizationFactors,
  }

  const { analysisResults, componentResults, yearlyData } = calculatedResults

  // Check export readiness
  const roiCheck = checkROIExportThreshold(analysisResults?.roi || 0)
  const exportReadiness = checkExportReadiness(
    analysisResults?.roi || 0,
    !!opportunity.product,
    !!agentData.agentCount,
    !!pricing.unitPrice,
    true
  )

  // Group components by category
  const ticketEliminationComponents = componentResults?.filter(
    (c) => c.category === 'ticketElimination'
  ) || []
  const agentProductivityComponents = componentResults?.filter(
    (c) => c.category === 'agentProductivity'
  ) || []
  const costSavingsComponents = componentResults?.filter(
    (c) => c.category === 'costSavings'
  ) || []

  const handleGenerateReport = async () => {
    if (!exportReadiness.canExport) {
      alert(`Cannot export:\n${exportReadiness.blockers.join('\n')}`)
      return
    }

    if (exportReadiness.warnings.length > 0) {
      const proceed = confirm(
        `Warnings:\n${exportReadiness.warnings.join('\n')}\n\nDo you want to proceed?`
      )
      if (!proceed) return
    }

    try {
      await generatePDFReport({
        opportunity,
        results: calculatedResults,
        customerName: 'Valued Customer', // TODO: Add customer name field
        executiveSummary: undefined, // TODO: Add executive summary field
        currencySymbol,
      })
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ROI Analysis Results
          </h2>
          <p className="text-gray-600">
            Comprehensive 3-year ROI analysis with component-level breakdown
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showDebugMode}
              onChange={(e) => setShowDebugMode(e.target.checked)}
              className="mr-2"
            />
            Debug Mode
          </label>
        </div>
      </div>

      {/* Guardrail Warnings */}
      {!roiCheck.allowed && roiCheck.error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{roiCheck.error}</p>
            </div>
          </div>
        </div>
      )}

      {exportReadiness.warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warnings:</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  {exportReadiness.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Headline Dashboard Metrics */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Headline Dashboard Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* ROI */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs font-medium text-gray-600 mb-1">ROI (3-Year)</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPercentage(analysisResults?.roi || 0)}
            </p>
          </div>

          {/* Payback Period */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs font-medium text-gray-600 mb-1">
              Payback Period
            </p>
            <p className="text-2xl font-bold text-primary-600">
              {formatMonths(analysisResults?.paybackPeriod || 0)}
            </p>
          </div>

          {/* Total Benefits */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs font-medium text-gray-600 mb-1">
              Total Benefits (3-Year)
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(analysisResults?.totalBenefits3yr || 0, currencySymbol)}
            </p>
          </div>

          {/* Total Costs */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-xs font-medium text-gray-600 mb-1">
              Total Costs (3-Year)
            </p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(analysisResults?.totalCosts3yr || 0, currencySymbol)}
            </p>
          </div>
        </div>
      </div>

      {/* Component Breakdown Tables */}
      <div className="space-y-6">
        {/* Ticket Elimination */}
        {ticketEliminationComponents.length > 0 && (
          <ComponentBreakdownTable
            title="Ticket Elimination Benefits"
            components={ticketEliminationComponents}
            currencySymbol={currencySymbol}
          />
        )}

        {/* Agent Productivity */}
        {agentProductivityComponents.length > 0 && (
          <ComponentBreakdownTable
            title="Agent Productivity Benefits"
            components={agentProductivityComponents}
            currencySymbol={currencySymbol}
          />
        )}

        {/* Cost Savings */}
        {costSavingsComponents.length > 0 && (
          <ComponentBreakdownTable
            title="Cost Savings"
            components={costSavingsComponents}
            currencySymbol={currencySymbol}
          />
        )}
      </div>

      {/* Debug Mode */}
      {showDebugMode && <CalculationTrace state={state} calculatedResults={calculatedResults} />}

      {/* Actions */}
      <div className="flex justify-center pt-6 border-t">
        <Button
          onClick={handleGenerateReport}
          disabled={!exportReadiness.canExport}
          size="lg"
          className="px-8"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generate PDF Report
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={previousStep} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={resetWizard} variant="secondary" size="lg">
          Start New Analysis
        </Button>
      </div>
    </div>
  )
}

// Component breakdown table
interface ComponentBreakdownTableProps {
  title: string
  components: ComponentResult[]
  currencySymbol: string
}

function ComponentBreakdownTable({
  title,
  components,
  currencySymbol,
}: ComponentBreakdownTableProps) {
  const total = components.reduce((sum, c) => sum + c.total, 0)

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Component
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Year 1
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Year 2
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Year 3
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {components.map((component) => (
              <tr key={component.componentId}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {component.componentName}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {formatCurrency(component.year1, currencySymbol)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {formatCurrency(component.year2, currencySymbol)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {formatCurrency(component.year3, currencySymbol)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                  {formatCurrency(component.total, currencySymbol)}
                </td>
              </tr>
            ))}
            <tr className="bg-green-100 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900">Total</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {formatCurrency(
                  components.reduce((sum, c) => sum + c.year1, 0),
                  currencySymbol
                )}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {formatCurrency(
                  components.reduce((sum, c) => sum + c.year2, 0),
                  currencySymbol
                )}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {formatCurrency(
                  components.reduce((sum, c) => sum + c.year3, 0),
                  currencySymbol
                )}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {formatCurrency(total, currencySymbol)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
