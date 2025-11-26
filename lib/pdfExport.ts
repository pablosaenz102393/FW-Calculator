/**
 * PDF DOCUMENT EXPORT
 *
 * Generates .pdf reports with:
 * - Header (customer info, plan, date, currency)
 * - Headline dashboard metrics
 * - Executive summary (editable)
 * - Detailed breakdown tables
 * - Export metadata for audit
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ResultsData, OpportunityData, ComponentResult } from '@/types'

interface ExportData {
  opportunity: Partial<OpportunityData>
  results: ResultsData
  customerName?: string
  executiveSummary?: string
  currencySymbol: string
}

/**
 * Generate and download PDF document
 */
export async function generatePDFReport(data: ExportData): Promise<void> {
  const doc = new jsPDF()

  const { opportunity, results, customerName, executiveSummary, currencySymbol } = data

  let yPosition = 20

  // Header section
  yPosition = addHeaderSection(doc, opportunity, customerName || 'Customer Name', yPosition)

  // Headline dashboard
  yPosition = addDashboardMetrics(doc, results, currencySymbol, yPosition)

  // Executive summary
  yPosition = addExecutiveSummary(doc, executiveSummary, yPosition)

  // Component breakdowns
  yPosition = addComponentBreakdowns(doc, results, currencySymbol, yPosition)

  // Year-by-year breakdown
  yPosition = addYearlyBreakdown(doc, results, currencySymbol, yPosition)

  // Footer
  addFooter(doc)

  // Download
  const fileName = `Freshservice_ROI_Report_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

/**
 * Add header section
 */
function addHeaderSection(
  doc: jsPDF,
  opportunity: Partial<OpportunityData>,
  customerName: string,
  yPosition: number
): number {
  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Freshservice Self-Service ROI Calculator', 105, yPosition, { align: 'center' })

  yPosition += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Return on Investment Analysis Report', 105, yPosition, { align: 'center' })

  yPosition += 15
  doc.setFontSize(11)

  // Customer info
  doc.setFont('helvetica', 'bold')
  doc.text('Customer: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(customerName, 50, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Product: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(opportunity.product || 'N/A', 50, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Plan: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(opportunity.plan || 'N/A', 50, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Currency: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(opportunity.localCurrency || 'USD', 50, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Date: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString(), 50, yPosition)

  return yPosition + 15
}

/**
 * Add dashboard metrics
 */
function addDashboardMetrics(
  doc: jsPDF,
  results: ResultsData,
  currencySymbol: string,
  yPosition: number
): number {
  const { analysisResults } = results

  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Headline Dashboard Metrics', 20, yPosition)

  yPosition += 10
  doc.setFontSize(11)

  doc.setFont('helvetica', 'bold')
  doc.text('ROI (3-Year): ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(`${analysisResults.roi.toFixed(1)}%`, 70, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Payback Period: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(`${analysisResults.paybackPeriod.toFixed(1)} months`, 70, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Net Present Value: ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCurrency(analysisResults.npv, currencySymbol), 70, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Total Benefits (3-Year): ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCurrency(analysisResults.totalBenefits3yr, currencySymbol), 70, yPosition)

  yPosition += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Total Costs (3-Year): ', 20, yPosition)
  doc.setFont('helvetica', 'normal')
  doc.text(formatCurrency(analysisResults.totalCosts3yr, currencySymbol), 70, yPosition)

  return yPosition + 15
}

/**
 * Add executive summary
 */
function addExecutiveSummary(
  doc: jsPDF,
  executiveSummary: string | undefined,
  yPosition: number
): number {
  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Executive Summary', 20, yPosition)

  yPosition += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const summary = executiveSummary ||
    'This ROI analysis demonstrates the value of implementing Freshservice. The calculations are based on industry benchmarks and customer-provided data.'

  const splitText = doc.splitTextToSize(summary, 170)
  doc.text(splitText, 20, yPosition)

  return yPosition + (splitText.length * 7) + 15
}

/**
 * Add component breakdowns
 */
function addComponentBreakdowns(
  doc: jsPDF,
  results: ResultsData,
  currencySymbol: string,
  yPosition: number
): number {
  // Group by category
  const ticketElim = results.componentResults.filter((c) => c.category === 'ticketElimination')
  const agentProd = results.componentResults.filter((c) => c.category === 'agentProductivity')
  const costSavings = results.componentResults.filter((c) => c.category === 'costSavings')

  if (ticketElim.length > 0) {
    yPosition = addComponentTable(doc, 'Ticket Elimination Benefits', ticketElim, currencySymbol, yPosition)
  }

  if (agentProd.length > 0) {
    yPosition = addComponentTable(doc, 'Agent Productivity Benefits', agentProd, currencySymbol, yPosition)
  }

  if (costSavings.length > 0) {
    yPosition = addComponentTable(doc, 'Cost Savings', costSavings, currencySymbol, yPosition)
  }

  return yPosition
}

/**
 * Add component table
 */
function addComponentTable(
  doc: jsPDF,
  title: string,
  components: ComponentResult[],
  currencySymbol: string,
  yPosition: number
): number {
  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, yPosition)
  yPosition += 7

  const tableData = components.map(c => [
    c.componentName,
    formatCurrency(c.year1, currencySymbol),
    formatCurrency(c.year2, currencySymbol),
    formatCurrency(c.year3, currencySymbol),
    formatCurrency(c.total, currencySymbol),
  ])

  // Add total row
  tableData.push([
    'Total',
    formatCurrency(components.reduce((sum, c) => sum + c.year1, 0), currencySymbol),
    formatCurrency(components.reduce((sum, c) => sum + c.year2, 0), currencySymbol),
    formatCurrency(components.reduce((sum, c) => sum + c.year3, 0), currencySymbol),
    formatCurrency(components.reduce((sum, c) => sum + c.total, 0), currencySymbol),
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Component', 'Year 1', 'Year 2', 'Year 3', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  })

  return (doc as any).lastAutoTable.finalY + 15
}

/**
 * Add yearly breakdown
 */
function addYearlyBreakdown(
  doc: jsPDF,
  results: ResultsData,
  currencySymbol: string,
  yPosition: number
): number {
  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Year-by-Year Cash Flow', 20, yPosition)
  yPosition += 7

  const tableData = results.yearlyData.map(year => [
    `Year ${year.year}`,
    formatCurrency(year.benefits, currencySymbol),
    formatCurrency(year.costs, currencySymbol),
    formatCurrency(year.netCashFlow, currencySymbol),
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Year', 'Benefits', 'Costs', 'Net Cash Flow']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  })

  return (doc as any).lastAutoTable.finalY + 15
}

/**
 * Add footer
 */
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(
      `Generated with Freshservice ROI Calculator on ${new Date().toLocaleDateString()}`,
      105,
      280,
      { align: 'center' }
    )
    doc.text(
      'This report is for informational purposes only. Actual results may vary.',
      105,
      285,
      { align: 'center' }
    )
  }
}

/**
 * Format currency
 */
function formatCurrency(value: number, currencySymbol: string): string {
  return `${currencySymbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}
