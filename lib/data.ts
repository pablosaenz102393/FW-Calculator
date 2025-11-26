import {
  Product,
  EngagementType,
  NewPlan,
  ExistingPlan,
  Currency,
  Plan,
} from '@/types'

// Products
export const PRODUCTS: { value: Product; label: string }[] = [
  { value: 'EX', label: 'EX (Employee Experience)' },
  { value: 'CX', label: 'CX (Customer Experience)' },
]

// Engagement Types
export const ENGAGEMENT_TYPES: { value: EngagementType; label: string }[] = [
  { value: 'New', label: 'New' },
  { value: 'Existing', label: 'Existing' },
]

// Plans for New Engagement
export const NEW_PLANS: { value: NewPlan; label: string }[] = [
  { value: 'Growth', label: 'Growth' },
  { value: 'Pro', label: 'Pro' },
  { value: 'Enterprise', label: 'Enterprise' },
]

// Plans for Existing Engagement
export const EXISTING_PLANS: { value: ExistingPlan; label: string }[] = [
  { value: 'Growth to Pro', label: 'Growth to Pro' },
  { value: 'Pro to Enterprise', label: 'Pro to Enterprise' },
]

// Currencies
export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: '$ USD', symbol: '$' },
  { value: 'INR', label: '₹ INR', symbol: '₹' },
  { value: 'GBP', label: '£ GBP', symbol: '£' },
  { value: 'EUR', label: '€ EUR', symbol: '€' },
  { value: 'JPY', label: '¥ JPY', symbol: '¥' },
]

// Default Unit Prices (in USD, can be converted based on selected currency)
// Growth: $49/mo = $588/year, Pro: $99/mo = $1,188/year
export const DEFAULT_UNIT_PRICES: Record<Plan, number> = {
  'Growth': 588,
  'Pro': 1188,
  'Enterprise': 2376,
  'Growth to Pro': 588,
  'Pro to Enterprise': 1188,
}

// Default Implementation Prices
export const DEFAULT_IMPLEMENTATION_PRICES: Record<Plan, number> = {
  'Growth': 5000,
  'Pro': 10000,
  'Enterprise': 20000,
  'Growth to Pro': 7500,
  'Pro to Enterprise': 15000,
}

// Freddy Co-Pilot pricing (per agent per year)
// $29/month when billed annually = $348/year per agent
export const FREDDY_COPILOT_PRICE_PER_AGENT = 348

// Maturity Area Configurations
export interface MaturityAreaConfig {
  name: string
  label: string
  description: string
  availableForPlans: Plan[]
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

export const MATURITY_AREAS: MaturityAreaConfig[] = [
  {
    name: 'knowledgeBase',
    label: 'Knowledge Base',
    description: 'Self-service knowledge base adoption',
    availableForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    defaultPercentages: {
      low: 7.5,
      medium: 5,
      high: 0,
    },
    otherRange: {
      min: 0,
      max: 20,
    },
    timeSavedRange: {
      min: 0,
      max: 10,
      default: 5,
    },
  },
  {
    name: 'automationServiceRequests',
    label: 'Automation of Service Requests',
    description: 'Automated service request fulfillment',
    availableForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    defaultPercentages: {
      low: 15,
      medium: 10,
      high: 5,
    },
    otherRange: {
      min: 0,
      max: 30,
    },
  },
]

// Get plans based on engagement type
export function getPlansForEngagement(engagement: EngagementType): { value: Plan; label: string }[] {
  return engagement === 'New' ? NEW_PLANS : EXISTING_PLANS
}

// Get maturity areas for a specific plan
export function getMaturityAreasForPlan(plan: Plan): MaturityAreaConfig[] {
  return MATURITY_AREAS.filter(area => area.availableForPlans.includes(plan))
}
