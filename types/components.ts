// Component Categories
export type ComponentCategory = 'ticketElimination' | 'agentProductivity' | 'costSavings'

// Component IDs
export type TicketEliminationComponent =
  | 'knowledgeBase'
  | 'automationServiceRequests'
  | 'freddyAIAgent'
  | 'proactiveProblemManagement'
  | 'esmTicketElimination'

export type AgentProductivityComponent =
  | 'incidentManagement'
  | 'serviceRequestManagement'
  | 'problemManagement'
  | 'changeManagement'
  | 'projectManagement'
  | 'assetManagement'
  | 'cmdb'
  | 'serviceCatalogExpansion'
  | 'esmAgentProductivity'

export type CostSavingsComponent =
  | 'licenseConsolidation'
  | 'infrastructureSavings'
  | 'vendorSpendReduction'
  | 'esmSharedServices'
  | 'freddyCopilotSavings'

export type ComponentId =
  | TicketEliminationComponent
  | AgentProductivityComponent
  | CostSavingsComponent

// Maturity Level
export type MaturityLevel = 'Low' | 'Medium' | 'High' | 'Other'

// Component Input Types
export interface TicketEliminationInputs {
  numberOfTickets: number
  percentEliminated: number
  timeSavedMinutes: number
}

export interface AgentProductivityStandardInputs {
  ticketsRemaining: number
  timeSavedMinutes: number
}

export interface AgentProductivityTimeBasedInputs {
  timeSpentTodayHours: number
  percentTimeSaved: number
}

export interface ChangeManagementInputs {
  numberOfChanges: number
  avgPercentFailedChanges: number
  percentReductionInFailedChanges: number
  timeSavedMinutes: number
}

export interface LicenseConsolidationInputs {
  numberOfToolsEliminated: number
  costPerToolEliminated: number
}

export interface InfrastructureSavingsInputs {
  annualInfraCostBefore: number
  annualInfraCostAfter: number
}

export interface VendorSpendInputs {
  currentVendorSpend: number
  percentReduction: number
}

export interface ESMSharedServicesInputs {
  hrBudget: number
  facilitiesBudget: number
  legalBudget: number
  financeBudget: number
  percentSaved: number
}

export interface FreddyCopilotInputs {
  numberOfInteractions: number
  percentHandledByAI: number
  timeSavedMinutes: number
}

// Component Configuration
export interface ComponentConfig {
  id: ComponentId
  name: string
  description: string
  category: ComponentCategory
  tooltip: string

  // Visibility rules
  visibleForPlans: string[]
  requiresESM: boolean
  requiresFreddy: boolean

  // Maturity configuration
  supportsMaturity: boolean
  maturityDefaults?: {
    low: { percentEliminated?: number; timeSavedMinutes?: number; [key: string]: any }
    medium: { percentEliminated?: number; timeSavedMinutes?: number; [key: string]: any }
    high: { percentEliminated?: number; timeSavedMinutes?: number; [key: string]: any }
  }
  otherRange?: {
    min: number
    max: number
  }

  // Input fields
  inputFields: ComponentInputField[]
}

export interface ComponentInputField {
  id: string
  label: string
  type: 'number' | 'percent' | 'currency' | 'hours'
  required: boolean
  min?: number
  max?: number
  defaultValue?: number
  tooltip?: string
  dependsOn?: string[] // Field IDs this depends on
}

// Component Values
export interface ComponentValue {
  componentId: ComponentId
  maturityLevel?: MaturityLevel
  customPercentage?: number
  manualOverride: boolean

  // Input values
  inputs: Record<string, number>

  // Calculated values
  annualBenefit: number
  year1Benefit: number
  year2Benefit: number
  year3Benefit: number
}

// Manual Override
export interface ManualOverride {
  componentId: ComponentId
  fieldId: string
  originalValue: number
  overriddenValue: number
  timestamp: Date
}
