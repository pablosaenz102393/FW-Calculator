'use client'

import { useWizard } from '@/contexts/WizardContext'
import Button from '@/components/ui/Button'
import { CURRENCY_SYMBOLS } from '@/types'
import { formatCurrency, formatPercentage, formatMonths } from '@/lib/calculations'

export default function ResultsStep() {
  const { state, previousStep, resetWizard } = useWizard()
  const { results, opportunity } = state

  const currencySymbol = opportunity.localCurrency
    ? CURRENCY_SYMBOLS[opportunity.localCurrency]
    : '$'

  // Calculate ticket elimination benefits from componentResults
  const ticketEliminationComponents = (results.componentResults || []).filter(
    (c) => c.category === 'ticketElimination'
  )

  const totalBenefits = (results.componentResults || []).reduce(
    (sum, c) => sum + c.total,
    0
  )

  const handleGenerateReport = () => {
    // Create a printable report
    const reportWindow = window.open('', '_blank')
    if (!reportWindow) {
      alert('Please allow pop-ups to generate the report')
      return
    }

    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Freshservice ROI Calculator - Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 900px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .header {
              background: linear-gradient(135deg, #0284c7 0%, #075985 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .header p {
              margin: 0;
              opacity: 0.9;
            }
            .section {
              background: #f8fafc;
              padding: 25px;
              border-radius: 10px;
              margin-bottom: 20px;
              border-left: 4px solid #0284c7;
            }
            .section h2 {
              margin: 0 0 20px 0;
              color: #0284c7;
              font-size: 20px;
            }
            .metric {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .metric:last-child {
              border-bottom: none;
            }
            .metric-label {
              font-weight: 500;
              color: #64748b;
            }
            .metric-value {
              font-weight: 700;
              color: #0f172a;
              font-size: 18px;
            }
            .highlight {
              background: #dbeafe;
              padding: 20px;
              border-radius: 10px;
              margin-top: 20px;
            }
            .total {
              font-size: 24px;
              font-weight: 700;
              color: #0284c7;
              text-align: right;
              margin-top: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Freshservice Self-Service ROI Calculator</h1>
            <p>Return on Investment Analysis Report</p>
            <p style="font-size: 14px; margin-top: 10px;">
              Generated on ${new Date().toLocaleDateString()}
            </p>
          </div>

          <div class="section">
            <h2>Opportunity Summary</h2>
            <div class="metric">
              <span class="metric-label">Product:</span>
              <span class="metric-value">${opportunity.product || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Plan:</span>
              <span class="metric-value">${opportunity.plan || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Engagement Type:</span>
              <span class="metric-value">${opportunity.engagement || '-'}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Local Currency:</span>
              <span class="metric-value">${opportunity.localCurrency || '-'}</span>
            </div>
          </div>

          <div class="section">
            <h2>Ticket Elimination Benefits</h2>
            ${ticketEliminationComponents
              .map(
                (component) => `
              <div class="metric">
                <span class="metric-label">${component.componentName}</span>
                <span class="metric-value">${formatCurrency(component.total, currencySymbol)}</span>
              </div>
            `
              )
              .join('')}
            <div class="highlight">
              <div class="total">
                Total Annual Benefits: ${formatCurrency(totalBenefits, currencySymbol)}
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Analysis Results</h2>
            <div class="metric">
              <span class="metric-label">Return on Investment (ROI):</span>
              <span class="metric-value">${formatPercentage(results.analysisResults?.roi || 0)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Payback Period:</span>
              <span class="metric-value">${formatMonths(results.analysisResults?.paybackPeriod || 0)}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Freshservice Self-Service ROI Calculator</strong></p>
            <p>This report is generated for informational purposes only.</p>
            <p>Actual results may vary based on specific implementation and usage patterns.</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="
              background: #0284c7;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
            ">
              Print Report
            </button>
            <button onclick="window.close()" style="
              background: #6b7280;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              margin-left: 10px;
            ">
              Close
            </button>
          </div>
        </body>
      </html>
    `

    reportWindow.document.write(reportContent)
    reportWindow.document.close()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ROI Analysis Results</h2>
        <p className="text-gray-600">
          Here&apos;s your comprehensive return on investment analysis.
        </p>
      </div>

      {/* Ticket Elimination Benefits */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Ticket Elimination Benefits
        </h3>
        <div className="space-y-3">
          {ticketEliminationComponents.map((component) => (
            <div
              key={component.componentId}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm"
            >
              <span className="font-medium text-gray-700">{component.componentName}</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(component.total, currencySymbol)}
              </span>
            </div>
          ))}
          <div className="mt-4 p-4 bg-green-600 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Annual Benefits</span>
              <span className="text-2xl font-bold">
                {formatCurrency(totalBenefits, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ROI */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Return on Investment (ROI)
            </p>
            <p className="text-3xl font-bold text-primary-600">
              {formatPercentage(results.analysisResults?.roi || 0)}
            </p>
          </div>

          {/* Payback Period */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600 mb-1">Payback Period</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatMonths(results.analysisResults?.paybackPeriod || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button onClick={handleGenerateReport} size="lg" className="px-8">
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
          Generate Report
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
