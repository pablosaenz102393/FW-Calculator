// Enums and Types
export type Product = 'EX' | 'CX'
export type EngagementType = 'New' | 'Existing'
export type NewPlan = 'Growth' | 'Pro' | 'Enterprise'
export type ExistingPlan = 'Growth to Pro' | 'Pro to Enterprise'
export type Plan = NewPlan | ExistingPlan
export type Currency = 'USD' | 'INR' | 'GBP' | 'EUR' | 'JPY'
export type PricingType = 'List' | 'Custom'
export type MaturityLevel = 'Low' | 'Medium' | 'High' | 'Other'

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  INR: '₹',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
}

// Opportunity Data
export interface OpportunityData {
  opportunityId?: string
  product: Product
  engagement: EngagementType
  plan: Plan
  localCurrency: Currency
  esm: boolean
  freddyCoPilot: boolean
}

// Data Tab
export interface AgentData {
  agentCount: number
  itAgents?: number // Used when ESM is enabled
  esmAgents?: number // Used when ESM is enabled
  annualIncidents: number
  annualServiceRequests: number
  individualAgentExpense: number
  currentLicensing: number
  currentMaintenance: number
}

// Pricing
export interface PricingData {
  pricingType: PricingType
  unitPrice: number
  implementationPrice: number
  premiumSupportPrice?: number
  otherCosts?: number
}

// Maturity
export interface MaturityArea {
  name: string
  level: MaturityLevel
  customPercentage?: number
  customTimeSaved?: number
  defaultPercentages: {
    low: number
    medium: number
    high: number
  }
  otherRange: {
    min: number
    max: number
  }
  timeSavedRange?: {
    min: number
    max: number
    default: number
  }
}

export interface MaturityData {
  knowledgeBase: MaturityArea
  automationServiceRequests: MaturityArea
  [key: string]: MaturityArea // Allow for additional maturity areas
}

// Benefit Realization Factors
export interface BenefitRealizationFactors {
  year1: number // default 0.5 (50%)
  year2: number // default 0.75 (75%)
  year3: number // default 1.0 (100%)
}

// Per-Year Data
export interface YearlyData {
  year: number
  benefits: number
  costs: number
  netCashFlow: number
  realizedBenefits: number
}

// Component Results
export interface ComponentResult {
  componentId: string
  componentName: string
  category: 'ticketElimination' | 'agentProductivity' | 'costSavings'
  annualBenefit: number
  year1: number
  year2: number
  year3: number
  total: number
}

// Results
export interface AnalysisResults {
  roi: number // percentage
  paybackPeriod: number // months
  totalBenefits3yr: number
  totalCosts3yr: number
}

export interface ResultsData {
  componentResults: ComponentResult[]
  yearlyData: YearlyData[]
  analysisResults: AnalysisResults
  discountRate: number
  benefitRealizationFactors: BenefitRealizationFactors
}

// Advanced Configuration
export interface AdvancedConfig {
  discountRate: number
  benefitRealizationFactors: BenefitRealizationFactors
  roiGuardrailEnabled: boolean
  debugModeEnabled: boolean
}

// Component Data (from components.ts)
export interface ComponentData {
  [key: string]: {
    maturityLevel?: MaturityLevel
    customPercentage?: number
    manualOverride: boolean
    inputs: Record<string, number>
  }
}

// Wizard State
export type WizardStep = 'opportunity' | 'data' | 'verify' | 'maturity' | 'results'

export interface WizardState {
  currentStep: WizardStep
  opportunity: Partial<OpportunityData>
  agentData: Partial<AgentData>
  pricing: Partial<PricingData>
  maturity: Partial<MaturityData>
  componentData: Partial<ComponentData>
  advancedConfig: AdvancedConfig
  results: Partial<ResultsData>
}

// Re-export component types
export * from './components'
