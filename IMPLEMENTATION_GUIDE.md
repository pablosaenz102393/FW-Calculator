# Freshservice ROI Calculator - Implementation Guide

## 🎯 Project Overview

This is a comprehensive ROI calculator built with Next.js 15, React 18, and TypeScript. It implements a 5-step wizard to calculate 3-year return on investment for Freshservice implementations across 19 distinct components.

## 📁 Project Structure

```
fw-calc-v3/
├── app/                        # Next.js app directory
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── steps/                 # Wizard step components
│   │   ├── OpportunityStep.tsx
│   │   ├── DataStep.tsx
│   │   ├── VerifyStep.tsx
│   │   ├── MaturityStep.tsx
│   │   ├── ResultsStep.tsx        # Original (2 components)
│   │   └── EnhancedResultsStep.tsx # New (19 components)
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   └── Radio.tsx
│   ├── ROICalculator.tsx      # Main wrapper
│   └── WizardTabs.tsx         # Tab navigation
├── contexts/                   # React contexts
│   └── WizardContext.tsx      # Wizard state management
├── lib/                        # Business logic & utilities
│   ├── calculations.ts        # Original calculation formulas
│   ├── calculationEngine.ts   # NEW: 19-component engine
│   ├── controlPanel.ts        # NEW: Component configurations
│   ├── data.ts               # Dropdown data & maturity areas
│   ├── guardrails.ts         # NEW: ROI validation rules
│   ├── validation.ts         # NEW: Input validation
│   ├── wordExport.ts         # NEW: Word document generation
│   └── utils.ts              # Utility functions
├── types/                      # TypeScript definitions
│   ├── index.ts              # Main types
│   └── components.ts         # NEW: Component-specific types
└── README.md                  # Original README
```

## 🚀 What's Been Built

### ✅ Core Infrastructure (COMPLETE)

1. **Type System** (`types/`)
   - Complete TypeScript interfaces for all 19 components
   - Per-year data structures
   - Component configurations
   - Manual override tracking
   - Benefit realization factors

2. **Control Panel** (`lib/controlPanel.ts`)
   - 19 component configurations
   - Visibility rules (Plan + ESM + Freddy)
   - Maturity defaults (Low/Medium/High/Other)
   - Input field definitions
   - Tooltips and descriptions

3. **Calculation Engine** (`lib/calculationEngine.ts`)
   - All 19 component formulas implemented
   - 3-year projections
   - Benefit realization factors (Year 1: 50%, Year 2: 75%, Year 3: 100%)
   - NPV, ROI, IRR, Payback Period calculations
   - Inter-component dependencies

4. **Validation System** (`lib/validation.ts`)
   - Input sanitization (commas, decimals)
   - Range validation
   - Required field checking
   - Percentage bounds
   - No negative values

5. **ROI Guardrails** (`lib/guardrails.ts`)
   - Export disabled when ROI > 300%
   - Warnings for ROI 100-300%
   - Manual override limits
   - Export readiness checks

6. **Word Export** (`lib/wordExport.ts`)
   - Professional .docx generation
   - Header with customer info
   - Dashboard metrics
   - Component breakdown tables
   - Year-by-year cash flow
   - Editable executive summary

7. **Enhanced Results Tab** (`components/steps/EnhancedResultsStep.tsx`)
   - Per-year breakdowns (Year 1, 2, 3, Total)
   - Component categorization
   - Guardrail warnings/errors
   - Debug mode
   - Word export integration

## 🔧 How the System Works

### 1. Component Architecture

Each of the 19 components has:
- **ID**: Unique identifier (e.g., 'knowledgeBase')
- **Name**: Display name (e.g., 'Knowledge Base (ITSM)')
- **Category**: ticketElimination | agentProductivity | costSavings
- **Visibility Rules**: Which plans/toggles enable it
- **Maturity Support**: Whether it uses Low/Med/High/Other
- **Input Fields**: Dynamic form fields with validation

### 2. Calculation Flow

```
Opportunity Data (Product, Plan, ESM, Freddy)
           ↓
     Control Panel filters visible components
           ↓
Agent Data (Salary, Tickets, Costs) → Calculate Hourly Rate
           ↓
  Maturity Selection → Get Default % or Custom
           ↓
Component Calculations (19 formulas)
           ↓
    Annual Benefits per Component
           ↓
Apply Benefit Realization (50% → 75% → 100%)
           ↓
3-Year Projection (Benefits - Costs)
           ↓
      ROI Metrics (ROI, NPV, IRR, Payback)
```

### 3. Formula Examples

**Ticket Elimination:**
```
Benefit = Tickets × (% Eliminated / 100) × (Time Saved mins / 60) × Hourly Rate
```

**Agent Productivity (Standard):**
```
Benefit = Tickets Remaining × (Time Saved mins / 60) × Hourly Rate
```

**Time-Based Productivity:**
```
Benefit = Hours per Week × 52 × (% Time Saved / 100) × Hourly Rate
```

**Cost Savings:**
```
Direct dollar reductions (e.g., Tools × Cost per Tool)
```

## 📊 The 19 Components

### Ticket Elimination (5)
1. **Knowledge Base (ITSM)** - Self-service deflection
2. **Automation of Service Requests (ITSM)** - Workflow automation
3. **Freddy AI Agent** - AI-powered resolution
4. **Proactive Problem Management** - Root cause elimination
5. **ESM Ticket Elimination** - Non-IT department deflection

### Agent Productivity (9)
6. **Incident Management** - Faster incident resolution
7. **Service Request Management** - Faster request fulfillment
8. **Problem Management** - Efficient root cause analysis
9. **Change Management** - Reduced failed changes
10. **Project Management** - Time saved on projects
11. **Asset Management** - Automated asset tracking
12. **CMDB** - Automated configuration management
13. **Service Catalog Expansion** - More self-service options
14. **ESM Agent Productivity** - Non-IT efficiency gains

### Cost Savings (5)
15. **License Consolidation** - Tool elimination
16. **Infrastructure Savings** - On-prem to cloud
17. **Vendor Spend Reduction** - Consolidation savings
18. **ESM Shared Services** - Department efficiency
19. **Freddy Copilot Savings** - Agent assist benefits

## 🎮 Current Status & Next Steps

### ✅ What Works Now
- Original 2-component calculator (still functional)
- All infrastructure for 19-component system
- Word export with demo data
- Enhanced Results tab with guardrails

### 🔄 Integration Needed
1. **Connect MaturityStep to new engine**
   - Currently uses old calculation system
   - Need to call `calculateROIResults()` with proper inputs
   - Map maturity selections to component inputs

2. **Switch from ResultsStep to EnhancedResultsStep**
   - Update `components/ROICalculator.tsx`
   - Change import and component name

3. **Add Component Data Collection**
   - Create new step or enhance existing Data tab
   - Collect inputs for all visible components
   - Use `getVisibleComponents()` to filter

4. **Testing & Refinement**
   - Test with real data scenarios
   - Verify calculations match Excel model
   - Add unit tests

## 🛠️ How to Continue Development

### To Use the New Calculation Engine:

```typescript
import { calculateROIResults } from '@/lib/calculationEngine'
import { getVisibleComponents } from '@/lib/controlPanel'

// 1. Get visible components
const components = getVisibleComponents(
  opportunity.plan,
  opportunity.esm,
  opportunity.freddyCoPilot
)

// 2. Prepare inputs
const calculationInputs = {
  hourlyRate: agentData.individualAgentExpense / 2080,
  componentData: {
    knowledgeBase: {
      inputs: {
        numberOfTickets: agentData.annualIncidents + agentData.annualServiceRequests,
        percentEliminated: 7.5, // from maturity selection
        timeSavedMinutes: 5,
      },
      enabled: true,
    },
    // ... other components
  },
  costs: {
    year1License: pricing.unitPrice * agentData.agentCount,
    year2License: pricing.unitPrice * agentData.agentCount,
    year3License: pricing.unitPrice * agentData.agentCount,
    year1Freddy: 0,
    year2Freddy: 0,
    year3Freddy: 0,
    implementation: pricing.implementationPrice,
  },
  benefitRealizationFactors: advancedConfig.benefitRealizationFactors,
  discountRate: advancedConfig.discountRate,
}

// 3. Calculate
const results = calculateROIResults(calculationInputs)

// 4. Store in state
updateResults(results)
```

### To Switch to Enhanced Results:

**File:** `components/ROICalculator.tsx`

```typescript
// Change this:
import ResultsStep from './steps/ResultsStep'

// To this:
import EnhancedResultsStep from './steps/EnhancedResultsStep'

// And in renderStep():
case 'results':
  return <EnhancedResultsStep />  // instead of <ResultsStep />
```

### To Add Customer Name & Executive Summary:

Add fields to OpportunityStep or create new fields in wizard state:

```typescript
// In types/index.ts:
export interface OpportunityData {
  // ... existing fields
  customerName?: string
  executiveSummary?: string
}

// Then use in Word export:
await generateWordReport({
  opportunity,
  results: calculatedResults,
  customerName: opportunity.customerName || 'Valued Customer',
  executiveSummary: opportunity.executiveSummary,
  currencySymbol,
})
```

## 📝 Configuration

### Control Panel Defaults

All defaults are in `lib/controlPanel.ts`. To update:

1. Find the component by ID
2. Update `maturityDefaults` for Low/Medium/High values
3. Update `otherRange` for custom bounds
4. Update `inputFields` for form configurations

### Benefit Realization Factors

Default: Year 1 = 50%, Year 2 = 75%, Year 3 = 100%

To customize, user can edit via advanced config or you can change defaults in:
```typescript
// contexts/WizardContext.tsx
advancedConfig: {
  benefitRealizationFactors: {
    year1: 0.5,  // 50%
    year2: 0.75, // 75%
    year3: 1.0,  // 100%
  },
  // ...
}
```

### Discount Rate

Default: 10%

Used in NPV calculation. User-editable via advanced config.

## 🧪 Testing

### Sample Calculation Test:

```typescript
// Test Knowledge Base calculation
const result = calculateKnowledgeBase(
  {
    numberOfTickets: 100000,
    percentEliminated: 7.5,
    timeSavedMinutes: 5,
  },
  48.08 // hourly rate
)
// Expected: 100000 × 0.075 × (5/60) × 48.08 = ~30,050
```

## 🐛 Known Limitations

1. **Inter-component Dependencies** - Currently simplified
   - Ticket elimination should reduce pools for productivity
   - Need more sophisticated tracking

2. **Maturity Integration** - Not yet connected
   - MaturityStep still uses old system
   - Need to map maturity → component inputs

3. **Dynamic Field Collection** - Not implemented
   - Components have different input needs
   - Need dynamic form based on visible components

4. **Excel Import** - Not implemented
   - Control panel can't import from Excel yet
   - Placeholder defaults in place

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `lib/calculationEngine.ts` | Core ROI calculations (19 components) |
| `lib/controlPanel.ts` | Component configurations & visibility |
| `lib/guardrails.ts` | ROI validation & export rules |
| `lib/validation.ts` | Input sanitization & validation |
| `lib/wordExport.ts` | Word document generation |
| `types/components.ts` | Component type definitions |
| `contexts/WizardContext.tsx` | State management |
| `components/steps/EnhancedResultsStep.tsx` | Results display |

## 💡 Tips for Development

1. **Use Debug Mode** - Toggle in EnhancedResultsStep to see full state
2. **Check Browser Console** - Calculation errors logged there
3. **Validate Inputs** - Use validation utilities before calculations
4. **Test Incrementally** - Start with 1-2 components, expand gradually
5. **Follow Specification** - All formulas documented in requirements

## 🎨 UI Customization

The UI uses Tailwind CSS. Key color scheme:
- Primary: Blue (primary-600, primary-700, etc.)
- Success: Green
- Warning: Yellow
- Error: Red

To change theme, update `tailwind.config.ts`.

## 📞 Support & Questions

For questions about:
- **Formulas**: See specification document
- **Components**: Check `lib/controlPanel.ts` comments
- **Types**: See `types/` directory
- **Calculations**: Review `lib/calculationEngine.ts`

---

**Last Updated**: October 2025
**Status**: Core engine complete, UI integration in progress
**Version**: 1.0.0-alpha
