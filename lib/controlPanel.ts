import { ComponentConfig } from '@/types'

/**
 * CONTROL PANEL - Configuration for all 19 ROI Components
 *
 * NOTE: Default values labeled "DEFAULT TBD FROM EXCEL MODEL" are placeholders
 * pending import from the canonical Excel ROI model.
 *
 * This control panel can be imported/exported from Excel and edited via admin interface.
 */

export const COMPONENT_CONFIGURATIONS: ComponentConfig[] = [
  // ============================================================================
  // TICKET ELIMINATION COMPONENTS (5)
  // ============================================================================
  {
    id: 'knowledgeBase',
    name: 'Knowledge Base (ITSM)',
    description: 'Self-service knowledge base articles that deflect tickets before they reach agents',
    category: 'ticketElimination',
    tooltip: 'Proportion of tickets deflected via KB articles and self-service portal. Users find answers without creating tickets.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentEliminated: 7.5, timeSavedMinutes: 5 },
      medium: { percentEliminated: 5, timeSavedMinutes: 5 },
      high: { percentEliminated: 0, timeSavedMinutes: 5 },
    },
    otherRange: { min: 0, max: 20 },
    inputFields: [
      {
        id: 'numberOfTickets',
        label: 'Total Annual Tickets',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Total incidents + service requests annually',
      },
      {
        id: 'percentEliminated',
        label: '% Tickets Eliminated',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        tooltip: 'Percentage of tickets deflected by knowledge base',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Ticket (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 5,
        tooltip: 'Average resolution time per ticket',
      },
    ],
  },

  {
    id: 'automationServiceRequests',
    name: 'Automation of Service Requests (ITSM)',
    description: 'Workflow automation that handles service requests without human intervention',
    category: 'ticketElimination',
    tooltip: 'Automated fulfillment of routine service requests (password resets, access requests, etc.) eliminating manual work.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentEliminated: 15, timeSavedMinutes: 10 },
      medium: { percentEliminated: 10, timeSavedMinutes: 10 },
      high: { percentEliminated: 5, timeSavedMinutes: 10 },
    },
    otherRange: { min: 0, max: 30 },
    inputFields: [
      {
        id: 'numberOfTickets',
        label: 'Total Annual Service Requests',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Total service requests handled annually',
      },
      {
        id: 'percentEliminated',
        label: '% Requests Automated',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        tooltip: 'Percentage of service requests fully automated',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Request (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 10,
        tooltip: 'Average time to manually fulfill a service request',
      },
    ],
  },

  {
    id: 'freddyAIAgent',
    name: 'Freddy AI Agent',
    description: 'AI-powered virtual agent resolves tickets autonomously',
    category: 'ticketElimination',
    tooltip: 'Freddy AI Agent handles common inquiries and resolves tickets without human agent involvement.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: true,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentEliminated: 12, timeSavedMinutes: 12 },
      medium: { percentEliminated: 8, timeSavedMinutes: 12 },
      high: { percentEliminated: 4, timeSavedMinutes: 12 },
    },
    otherRange: { min: 0, max: 25 },
    inputFields: [
      {
        id: 'numberOfTickets',
        label: 'Total Annual Tickets',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Total tickets eligible for AI handling',
      },
      {
        id: 'percentEliminated',
        label: '% Resolved by AI',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        tooltip: 'Percentage resolved by Freddy AI without escalation',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Ticket (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 12,
        tooltip: 'Average agent time saved per AI-resolved ticket',
      },
    ],
  },

  {
    id: 'proactiveProblemManagement',
    name: 'Proactive Problem Management',
    description: 'Root cause analysis eliminates recurring incidents',
    category: 'ticketElimination',
    tooltip: 'Identifying and fixing root causes prevents future incidents, reducing ticket volume.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentEliminated: 10, timeSavedMinutes: 30 },
      medium: { percentEliminated: 7, timeSavedMinutes: 30 },
      high: { percentEliminated: 3, timeSavedMinutes: 30 },
    },
    otherRange: { min: 0, max: 20 },
    inputFields: [
      {
        id: 'numberOfTickets',
        label: 'Total Annual Incidents',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Total incidents that could be prevented',
      },
      {
        id: 'percentEliminated',
        label: '% Incidents Prevented',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        tooltip: 'Percentage prevented through problem management',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Incident (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 30,
        tooltip: 'Average time to resolve recurring incidents',
      },
    ],
  },

  {
    id: 'esmTicketElimination',
    name: 'ESM Ticket Elimination',
    description: 'Self-service portals for HR, Facilities, Legal, and Finance reduce ticket volumes',
    category: 'ticketElimination',
    tooltip: 'Non-IT departments benefit from self-service, deflecting their tickets (PTO requests, workspace issues, contract questions, etc.).',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: true,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentEliminated: 15, timeSavedMinutes: 8 },
      medium: { percentEliminated: 10, timeSavedMinutes: 8 },
      high: { percentEliminated: 5, timeSavedMinutes: 8 },
    },
    otherRange: { min: 0, max: 30 },
    inputFields: [
      {
        id: 'hrTickets',
        label: 'Annual HR Tickets',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'HR service requests annually',
      },
      {
        id: 'facilitiesTickets',
        label: 'Annual Facilities Tickets',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Facilities/workspace requests annually',
      },
      {
        id: 'legalTickets',
        label: 'Annual Legal Tickets',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Legal department requests annually',
      },
      {
        id: 'financeTickets',
        label: 'Annual Finance Tickets',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Finance department requests annually',
      },
      {
        id: 'percentEliminated',
        label: '% Tickets Deflected',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        tooltip: 'Percentage deflected via ESM self-service',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Ticket (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 8,
        tooltip: 'Average handling time per ESM ticket',
      },
    ],
  },

  // ============================================================================
  // AGENT PRODUCTIVITY COMPONENTS (9)
  // ============================================================================
  {
    id: 'incidentManagement',
    name: 'Incident Management',
    description: 'Streamlined incident handling for remaining tickets after elimination',
    category: 'agentProductivity',
    tooltip: 'Time saved per ticket through better workflows, automation assists, and tools for remaining incidents.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { timeSavedMinutes: 10 },
      medium: { timeSavedMinutes: 7 },
      high: { timeSavedMinutes: 3 },
    },
    otherRange: { min: 0, max: 20 },
    inputFields: [
      {
        id: 'ticketsRemaining',
        label: 'Tickets Remaining (after elimination)',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Tickets still handled by agents after ticket elimination',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Ticket (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 7,
        tooltip: 'Time saved per incident through improved tools/workflows',
      },
    ],
  },

  {
    id: 'serviceRequestManagement',
    name: 'Service Request Management',
    description: 'Faster service request fulfillment for non-automated requests',
    category: 'agentProductivity',
    tooltip: 'Time saved per request for those still requiring manual fulfillment after automation.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { timeSavedMinutes: 12 },
      medium: { timeSavedMinutes: 8 },
      high: { timeSavedMinutes: 4 },
    },
    otherRange: { min: 0, max: 25 },
    inputFields: [
      {
        id: 'requestsRemaining',
        label: 'Requests Remaining (after automation)',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Service requests still manually fulfilled',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Request (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 8,
        tooltip: 'Time saved per manual service request',
      },
    ],
  },

  {
    id: 'problemManagement',
    name: 'Problem Management',
    description: 'Efficient root cause analysis and problem resolution',
    category: 'agentProductivity',
    tooltip: 'Time saved conducting problem investigations and implementing fixes.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { timeSavedMinutes: 30 },
      medium: { timeSavedMinutes: 20 },
      high: { timeSavedMinutes: 10 },
    },
    otherRange: { min: 0, max: 60 },
    inputFields: [
      {
        id: 'numberOfProblems',
        label: 'Annual Problems Investigated',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 50,
        tooltip: 'Number of formal problem investigations per year',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Problem (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 20,
        tooltip: 'Time saved per problem investigation/resolution',
      },
    ],
  },

  {
    id: 'changeManagement',
    name: 'Change Management',
    description: 'Reduce failed changes and time spent on change processes',
    category: 'agentProductivity',
    tooltip: 'Better change workflows reduce failed changes and time spent managing changes.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: {
        avgPercentFailedChanges: 15,
        percentReductionInFailedChanges: 30,
        timeSavedMinutes: 45,
      },
      medium: {
        avgPercentFailedChanges: 15,
        percentReductionInFailedChanges: 20,
        timeSavedMinutes: 45,
      },
      high: {
        avgPercentFailedChanges: 15,
        percentReductionInFailedChanges: 10,
        timeSavedMinutes: 45,
      },
    },
    otherRange: { min: 0, max: 50 },
    inputFields: [
      {
        id: 'numberOfChanges',
        label: 'Annual Changes',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 500,
        tooltip: 'Total changes implemented annually',
      },
      {
        id: 'avgPercentFailedChanges',
        label: 'Average % Failed Changes',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 15,
        tooltip: 'Current percentage of changes that fail',
      },
      {
        id: 'percentReductionInFailedChanges',
        label: '% Reduction in Failed Changes',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 20,
        tooltip: 'Improvement in change success rate',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time per Failed Change (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 45,
        tooltip: 'Time to remediate a failed change',
      },
    ],
  },

  {
    id: 'projectManagement',
    name: 'Project Management',
    description: 'Time saved managing projects with better tools and workflows',
    category: 'agentProductivity',
    tooltip: 'Improved project tracking, collaboration, and reporting saves project management time.',
    visibleForPlans: ['Enterprise', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentTimeSaved: 25 },
      medium: { percentTimeSaved: 15 },
      high: { percentTimeSaved: 8 },
    },
    otherRange: { min: 0, max: 40 },
    inputFields: [
      {
        id: 'timeSpentTodayHours',
        label: 'Current Weekly PM Hours',
        type: 'hours',
        required: true,
        min: 0,
        defaultValue: 20,
        tooltip: 'Hours per week spent on project management tasks',
      },
      {
        id: 'percentTimeSaved',
        label: '% Time Saved',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 15,
        tooltip: 'Percentage of PM time saved through better tools',
      },
    ],
  },

  {
    id: 'assetManagement',
    name: 'Asset Management',
    description: 'Streamlined asset tracking and lifecycle management',
    category: 'agentProductivity',
    tooltip: 'Automated asset discovery, tracking, and lifecycle management reduces manual effort.',
    visibleForPlans: ['Enterprise', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentTimeSaved: 30 },
      medium: { percentTimeSaved: 20 },
      high: { percentTimeSaved: 10 },
    },
    otherRange: { min: 0, max: 50 },
    inputFields: [
      {
        id: 'timeSpentTodayHours',
        label: 'Current Weekly Asset Mgmt Hours',
        type: 'hours',
        required: true,
        min: 0,
        defaultValue: 15,
        tooltip: 'Hours per week on asset management',
      },
      {
        id: 'percentTimeSaved',
        label: '% Time Saved',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 20,
        tooltip: 'Time saved through automated asset management',
      },
    ],
  },

  {
    id: 'cmdb',
    name: 'CMDB (Configuration Management Database)',
    description: 'Automated CMDB population and maintenance',
    category: 'agentProductivity',
    tooltip: 'Automated discovery and CMDB updates eliminate manual configuration tracking.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentTimeSaved: 40 },
      medium: { percentTimeSaved: 30 },
      high: { percentTimeSaved: 15 },
    },
    otherRange: { min: 0, max: 60 },
    inputFields: [
      {
        id: 'timeSpentTodayHours',
        label: 'Current Weekly CMDB Hours',
        type: 'hours',
        required: true,
        min: 0,
        defaultValue: 10,
        tooltip: 'Hours per week maintaining CMDB',
      },
      {
        id: 'percentTimeSaved',
        label: '% Time Saved',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 30,
        tooltip: 'Time saved through automated CMDB',
      },
    ],
  },

  {
    id: 'serviceCatalogExpansion',
    name: 'Service Catalog Expansion',
    description: 'Self-service catalog enables users to request services without tickets',
    category: 'agentProductivity',
    tooltip: 'Expanding the service catalog allows more services to be self-requested, reducing manual handling.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { timeSavedMinutes: 15 },
      medium: { timeSavedMinutes: 10 },
      high: { timeSavedMinutes: 5 },
    },
    otherRange: { min: 0, max: 30 },
    inputFields: [
      {
        id: 'additionalCatalogRequests',
        label: 'Additional Annual Catalog Requests',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 5000,
        tooltip: 'New requests handled via expanded catalog',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Request (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 10,
        tooltip: 'Time saved vs traditional ticket handling',
      },
    ],
  },

  {
    id: 'esmAgentProductivity',
    name: 'ESM Agent Productivity',
    description: 'Time saved handling ESM tickets (HR, Facilities, Legal, Finance) with better tools',
    category: 'agentProductivity',
    tooltip: 'Non-IT departments handle remaining tickets faster with improved workflows.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: true,
    requiresFreddy: false,
    supportsMaturity: true,
    maturityDefaults: {
      low: { timeSavedMinutes: 10 },
      medium: { timeSavedMinutes: 7 },
      high: { timeSavedMinutes: 3 },
    },
    otherRange: { min: 0, max: 20 },
    inputFields: [
      {
        id: 'hrTicketsRemaining',
        label: 'HR Tickets Remaining',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'HR tickets after ESM elimination',
      },
      {
        id: 'facilitiesTicketsRemaining',
        label: 'Facilities Tickets Remaining',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Facilities tickets after ESM elimination',
      },
      {
        id: 'legalTicketsRemaining',
        label: 'Legal Tickets Remaining',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Legal tickets after ESM elimination',
      },
      {
        id: 'financeTicketsRemaining',
        label: 'Finance Tickets Remaining',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Finance tickets after ESM elimination',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Ticket (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 7,
        tooltip: 'Time saved per ESM ticket through better tools',
      },
    ],
  },

  // ============================================================================
  // COST SAVINGS COMPONENTS (5)
  // ============================================================================
  {
    id: 'licenseConsolidation',
    name: 'License Consolidation',
    description: 'Eliminate redundant tools and consolidate licenses',
    category: 'costSavings',
    tooltip: 'Replacing multiple point solutions with Freshservice eliminates tool licensing costs.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: false,
    inputFields: [
      {
        id: 'numberOfToolsEliminated',
        label: 'Number of Tools Eliminated',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 3,
        tooltip: 'Tools/licenses replaced by Freshservice',
      },
      {
        id: 'costPerToolEliminated',
        label: 'Average Annual Cost per Tool',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 10000,
        tooltip: 'Average annual license cost per eliminated tool',
      },
    ],
  },

  {
    id: 'infrastructureSavings',
    name: 'Infrastructure Savings',
    description: 'Reduce on-premises infrastructure costs with SaaS',
    category: 'costSavings',
    tooltip: 'Moving to cloud-based Freshservice reduces server, storage, and data center costs.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: false,
    inputFields: [
      {
        id: 'annualInfraCostBefore',
        label: 'Current Annual Infrastructure Cost',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 50000,
        tooltip: 'Current on-prem infrastructure costs',
      },
      {
        id: 'annualInfraCostAfter',
        label: 'Infrastructure Cost After Migration',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 10000,
        tooltip: 'Remaining infrastructure costs after SaaS migration',
      },
    ],
  },

  {
    id: 'vendorSpendReduction',
    name: 'Vendor Spend Reduction',
    description: 'Consolidate vendor relationships and reduce spend',
    category: 'costSavings',
    tooltip: 'Consolidating vendors simplifies contracts and often yields volume discounts.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: false,
    supportsMaturity: false,
    inputFields: [
      {
        id: 'currentVendorSpend',
        label: 'Current Annual Vendor Spend',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 200000,
        tooltip: 'Total annual spend across ITSM vendors',
      },
      {
        id: 'percentReduction',
        label: '% Reduction in Vendor Spend',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 20,
        tooltip: 'Expected reduction through consolidation',
      },
    ],
  },

  {
    id: 'esmSharedServices',
    name: 'ESM Shared Services Savings',
    description: 'Centralize HR, Facilities, Legal, and Finance services for efficiency',
    category: 'costSavings',
    tooltip: 'Shared service model for ESM departments reduces duplication and overhead.',
    visibleForPlans: ['Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: true,
    requiresFreddy: false,
    supportsMaturity: false,
    inputFields: [
      {
        id: 'hrBudget',
        label: 'Annual HR Operations Budget',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 500000,
        tooltip: 'HR operations budget',
      },
      {
        id: 'facilitiesBudget',
        label: 'Annual Facilities Operations Budget',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 300000,
        tooltip: 'Facilities operations budget',
      },
      {
        id: 'legalBudget',
        label: 'Annual Legal Operations Budget',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 200000,
        tooltip: 'Legal operations budget',
      },
      {
        id: 'financeBudget',
        label: 'Annual Finance Operations Budget',
        type: 'currency',
        required: true,
        min: 0,
        defaultValue: 400000,
        tooltip: 'Finance operations budget',
      },
      {
        id: 'percentSaved',
        label: '% Saved Through Shared Services',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 15,
        tooltip: 'Efficiency gain from shared service model',
      },
    ],
  },

  {
    id: 'freddyCopilotSavings',
    name: 'Freddy Copilot Direct Savings',
    description: 'Agent assist tool saves time on every interaction',
    category: 'costSavings',
    tooltip: 'Freddy Copilot provides real-time suggestions, reducing average handle time.',
    visibleForPlans: ['Growth', 'Pro', 'Enterprise', 'Growth to Pro', 'Pro to Enterprise'],
    requiresESM: false,
    requiresFreddy: true,
    supportsMaturity: true,
    maturityDefaults: {
      low: { percentHandledByAI: 30, timeSavedMinutes: 3 },
      medium: { percentHandledByAI: 20, timeSavedMinutes: 3 },
      high: { percentHandledByAI: 10, timeSavedMinutes: 3 },
    },
    otherRange: { min: 0, max: 50 },
    inputFields: [
      {
        id: 'numberOfInteractions',
        label: 'Annual Agent Interactions',
        type: 'number',
        required: true,
        min: 0,
        tooltip: 'Total tickets/interactions handled by agents',
      },
      {
        id: 'percentHandledByAI',
        label: '% Assisted by Copilot',
        type: 'percent',
        required: true,
        min: 0,
        max: 100,
        defaultValue: 20,
        tooltip: 'Percentage of interactions where Copilot provides assistance',
      },
      {
        id: 'timeSavedMinutes',
        label: 'Time Saved per Interaction (minutes)',
        type: 'number',
        required: true,
        min: 0,
        defaultValue: 3,
        tooltip: 'Time saved when Copilot assists',
      },
    ],
  },
]

/**
 * Get visible components based on opportunity configuration
 */
export function getVisibleComponents(
  plan: string,
  esmEnabled: boolean,
  freddyEnabled: boolean
): ComponentConfig[] {
  return COMPONENT_CONFIGURATIONS.filter((config) => {
    // Check plan visibility
    if (!config.visibleForPlans.includes(plan)) {
      return false
    }

    // Check ESM requirement
    if (config.requiresESM && !esmEnabled) {
      return false
    }

    // Check Freddy requirement
    if (config.requiresFreddy && !freddyEnabled) {
      return false
    }

    return true
  })
}

/**
 * Get component by ID
 */
export function getComponentById(componentId: string): ComponentConfig | undefined {
  return COMPONENT_CONFIGURATIONS.find((c) => c.id === componentId)
}

/**
 * Get components by category
 */
export function getComponentsByCategory(
  category: 'ticketElimination' | 'agentProductivity' | 'costSavings'
): ComponentConfig[] {
  return COMPONENT_CONFIGURATIONS.filter((c) => c.category === category)
}
