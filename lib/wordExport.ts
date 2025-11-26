/**
 * WORD DOCUMENT EXPORT
 *
 * Generates .docx reports with:
 * - Header (customer info, plan, date, currency)
 * - Headline dashboard metrics
 * - Executive summary (editable)
 * - Detailed breakdown tables
 * - Export metadata for audit
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
} from 'docx'
import { saveAs } from 'file-saver'
import { ResultsData, OpportunityData, ComponentResult } from '@/types'

interface ExportData {
  opportunity: Partial<OpportunityData>
  results: ResultsData
  customerName?: string
  executiveSummary?: string
  currencySymbol: string
}

/**
 * Generate and download Word document
 */
export async function generateWordReport(data: ExportData): Promise<void> {
  const doc = createWordDocument(data)

  const blob = await Packer.toBlob(doc)
  const fileName = `Freshservice_ROI_Report_${new Date().toISOString().split('T')[0]}.docx`

  saveAs(blob, fileName)
}

/**
 * Create Word document structure
 */
function createWordDocument(data: ExportData): Document {
  const { opportunity, results, customerName, executiveSummary, currencySymbol } = data

  const sections = []

  // Header section
  sections.push(
    ...createHeaderSection(opportunity, customerName || 'Customer Name'),
    new Paragraph({ text: '', spacing: { after: 200 } })
  )

  // Headline dashboard
  sections.push(
    new Paragraph({
      text: 'Headline Dashboard Metrics',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    ...createDashboardMetrics(results, currencySymbol),
    new Paragraph({ text: '', spacing: { after: 200 } })
  )

  // Executive summary
  sections.push(
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      text:
        executiveSummary ||
        'This ROI analysis demonstrates the value of implementing Freshservice. The calculations are based on industry benchmarks and customer-provided data.',
      spacing: { after: 200 },
    })
  )

  // Component breakdowns
  sections.push(...createComponentBreakdowns(results, currencySymbol))

  // Year-by-year breakdown
  sections.push(...createYearlyBreakdown(results, currencySymbol))

  // Footer with generation info
  sections.push(
    new Paragraph({ text: '', spacing: { before: 400 } }),
    new Paragraph({
      children: [new TextRun({
        text: `Generated with Freshservice ROI Calculator on ${new Date().toLocaleDateString()}`,
        italics: true,
      })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new TextRun({
        text: 'This report is for informational purposes only. Actual results may vary.',
        italics: true,
      })],
      alignment: AlignmentType.CENTER,
    })
  )

  return new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  })
}

/**
 * Create header section
 */
function createHeaderSection(
  opportunity: Partial<OpportunityData>,
  customerName: string
): Paragraph[] {
  return [
    new Paragraph({
      text: 'Freshservice Self-Service ROI Calculator',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: 'Return on Investment Analysis Report',
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Customer: ', bold: true }),
        new TextRun({ text: customerName }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Product: ', bold: true }),
        new TextRun({ text: opportunity.product || 'N/A' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Plan: ', bold: true }),
        new TextRun({ text: opportunity.plan || 'N/A' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Currency: ', bold: true }),
        new TextRun({ text: opportunity.localCurrency || 'USD' }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun({ text: new Date().toLocaleDateString() }),
      ],
      spacing: { after: 400 },
    }),
  ]
}

/**
 * Create dashboard metrics
 */
function createDashboardMetrics(results: ResultsData, currencySymbol: string): Paragraph[] {
  const { analysisResults } = results

  return [
    new Paragraph({
      children: [
        new TextRun({ text: 'ROI (3-Year): ', bold: true }),
        new TextRun({ text: `${analysisResults.roi.toFixed(1)}%` }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Payback Period: ', bold: true }),
        new TextRun({ text: `${analysisResults.paybackPeriod.toFixed(1)} months` }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Net Present Value: ', bold: true }),
        new TextRun({
          text: `${currencySymbol}${analysisResults.npv.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Total Benefits (3-Year): ', bold: true }),
        new TextRun({
          text: `${currencySymbol}${analysisResults.totalBenefits3yr.toLocaleString(
            'en-US',
            { minimumFractionDigits: 0, maximumFractionDigits: 0 }
          )}`,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Total Costs (3-Year): ', bold: true }),
        new TextRun({
          text: `${currencySymbol}${analysisResults.totalCosts3yr.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
        }),
      ],
      spacing: { after: 200 },
    }),
  ]
}

/**
 * Create component breakdown tables
 */
function createComponentBreakdowns(
  results: ResultsData,
  currencySymbol: string
): (Paragraph | Table)[] {
  const sections: (Paragraph | Table)[] = []

  // Group by category
  const ticketElim = results.componentResults.filter((c) => c.category === 'ticketElimination')
  const agentProd = results.componentResults.filter((c) => c.category === 'agentProductivity')
  const costSavings = results.componentResults.filter((c) => c.category === 'costSavings')

  if (ticketElim.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Ticket Elimination Benefits',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      createComponentTable(ticketElim, currencySymbol)
    )
  }

  if (agentProd.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Agent Productivity Benefits',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      createComponentTable(agentProd, currencySymbol)
    )
  }

  if (costSavings.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Cost Savings',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      createComponentTable(costSavings, currencySymbol)
    )
  }

  return sections
}

/**
 * Create component breakdown table
 */
function createComponentTable(components: ComponentResult[], currencySymbol: string): Table {
  const rows = [
    // Header row
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Component', bold: true })] })],
          shading: { fill: 'E5E7EB' },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Year 1', bold: true })] })],
          shading: { fill: 'E5E7EB' },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Year 2', bold: true })] })],
          shading: { fill: 'E5E7EB' },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Year 3', bold: true })] })],
          shading: { fill: 'E5E7EB' },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })] })],
          shading: { fill: 'E5E7EB' },
        }),
      ],
    }),
  ]

  // Data rows
  components.forEach((component) => {
    rows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(component.componentName)] }),
          new TableCell({
            children: [
              new Paragraph(
                formatCurrencyForWord(component.year1, currencySymbol)
              ),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph(
                formatCurrencyForWord(component.year2, currencySymbol)
              ),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph(
                formatCurrencyForWord(component.year3, currencySymbol)
              ),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph(
                formatCurrencyForWord(component.total, currencySymbol)
              ),
            ],
          }),
        ],
      })
    )
  })

  // Total row
  const total = components.reduce((sum, c) => sum + c.total, 0)
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })] })],
          shading: { fill: 'F3F4F6' },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({
                text: formatCurrencyForWord(
                  components.reduce((sum, c) => sum + c.year1, 0),
                  currencySymbol
                ),
                bold: true,
              })],
            }),
          ],
          shading: { fill: 'F3F4F6' },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({
                text: formatCurrencyForWord(
                  components.reduce((sum, c) => sum + c.year2, 0),
                  currencySymbol
                ),
                bold: true,
              })],
            }),
          ],
          shading: { fill: 'F3F4F6' },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({
                text: formatCurrencyForWord(
                  components.reduce((sum, c) => sum + c.year3, 0),
                  currencySymbol
                ),
                bold: true,
              })],
            }),
          ],
          shading: { fill: 'F3F4F6' },
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({
                text: formatCurrencyForWord(total, currencySymbol),
                bold: true,
              })],
            }),
          ],
          shading: { fill: 'F3F4F6' },
        }),
      ],
    })
  )

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

/**
 * Create yearly breakdown
 */
function createYearlyBreakdown(results: ResultsData, currencySymbol: string): (Paragraph | Table)[] {
  return [
    new Paragraph({
      text: 'Year-by-Year Cash Flow',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
    new Table({
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Year', bold: true })] })],
              shading: { fill: 'E5E7EB' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Benefits', bold: true })] })],
              shading: { fill: 'E5E7EB' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Costs', bold: true })] })],
              shading: { fill: 'E5E7EB' },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Net Cash Flow', bold: true })] })],
              shading: { fill: 'E5E7EB' },
            }),
          ],
        }),
        ...results.yearlyData.map(
          (year) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(`Year ${year.year}`)] }),
                new TableCell({
                  children: [
                    new Paragraph(formatCurrencyForWord(year.benefits, currencySymbol)),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph(formatCurrencyForWord(year.costs, currencySymbol)),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph(formatCurrencyForWord(year.netCashFlow, currencySymbol)),
                  ],
                }),
              ],
            })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  ]
}

/**
 * Format currency for Word document
 */
function formatCurrencyForWord(value: number, currencySymbol: string): string {
  return `${currencySymbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}
