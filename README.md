# Freshservice Self-Service ROI Calculator

A modern, interactive ROI calculator built with Next.js 15, React, and TypeScript. This application helps prospects and customers calculate their return on investment when implementing Freshservice solutions.

## Features

### 5-Step Wizard Flow
1. **Opportunity** - Collect product, engagement type, plan, currency, and add-ons
2. **Data** - Gather agent details, annual volumes, and existing expenses
3. **Verify** - Review information and configure list or custom pricing
4. **Maturity** - Assess organizational maturity in key areas
5. **Results** - Display comprehensive ROI analysis with report generation

### Key Capabilities
- **Conditional Logic** - Plan options dynamically change based on engagement type
- **Currency Support** - Full support for USD, INR, GBP, EUR, and JPY
- **Dynamic Maturity Areas** - Maturity assessments shown based on selected plan
- **Real-time Calculations** - Automatic calculation of ROI, NPV, IRR, and Payback Period
- **Report Generation** - Generate printable PDF-ready reports
- **Responsive Design** - Mobile-friendly interface with modern UI
- **Form Validation** - Comprehensive validation with helpful error messages

## Tech Stack

- **Framework**: Next.js 15.0.0 (App Router)
- **UI**: React 18.3.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Form Management**: React Hook Form 7.53
- **Validation**: Zod 3.23
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3000

## Project Structure

```
fw-calc-v3/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── steps/                   # Wizard step components
│   │   ├── OpportunityStep.tsx
│   │   ├── DataStep.tsx
│   │   ├── VerifyStep.tsx
│   │   ├── MaturityStep.tsx
│   │   └── ResultsStep.tsx
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   └── Radio.tsx
│   ├── ROICalculator.tsx        # Main calculator wrapper
│   └── WizardTabs.tsx           # Tab navigation
├── contexts/                     # React contexts
│   └── WizardContext.tsx        # Wizard state management
├── lib/                          # Utility functions
│   ├── calculations.ts          # ROI calculation engine
│   ├── data.ts                  # Mock data and configurations
│   └── utils.ts                 # Helper utilities
├── types/                        # TypeScript types
│   └── index.ts                 # Type definitions
└── README.md
```

## Configuration

### Adding New Plans
Edit `lib/data.ts` to add new plans to `NEW_PLANS` or `EXISTING_PLANS`.

### Adding New Currencies
Add currency definitions to the `CURRENCIES` array in `lib/data.ts`.

### Adding Maturity Areas
Add new maturity configurations to the `MATURITY_AREAS` array in `lib/data.ts`.

### Customizing Calculations
Modify the calculation logic in `lib/calculations.ts` to adjust ROI formulas.

## Calculations

### Key Metrics Calculated

1. **ROI (Return on Investment)**
   - Formula: `((Total Benefits - Total Cost) / Total Cost) × 100`

2. **Payback Period**
   - Time required to recover the initial investment
   - Calculated in months

3. **NPV (Net Present Value)**
   - Present value of future cash flows minus initial investment
   - Uses 10% discount rate over 3 years

4. **IRR (Internal Rate of Return)**
   - Rate at which NPV equals zero
   - Approximation for uniform cash flows

### Benefit Calculations

- **Knowledge Base Benefits**: Based on ticket reduction percentages and agent hourly costs
- **Automation Benefits**: Based on service request automation and efficiency gains

## Customization

### Styling
The application uses Tailwind CSS. Customize colors in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Customize primary color palette
  }
}
```

### Adding New Features
1. Add new types in `types/index.ts`
2. Update wizard state in `contexts/WizardContext.tsx`
3. Create new step component in `components/steps/`
4. Update navigation in `components/ROICalculator.tsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

- Report generation requires pop-ups to be enabled
- Currency conversion rates are not dynamic (uses base prices)
- Maximum of 5 wizard steps currently supported

## Future Enhancements

- [ ] Add data persistence (localStorage/database)
- [ ] Implement real-time currency conversion
- [ ] Add comparison mode for multiple scenarios
- [ ] Export to Excel/CSV
- [ ] Add charts and visualizations
- [ ] Multi-language support
- [ ] Save and share reports via URL
- [ ] Integration with CRM systems

## Contributing

When contributing, please:
1. Follow the existing code style
2. Add TypeScript types for new features
3. Test all form validations
4. Ensure responsive design works on all devices

## License

This project is proprietary software for Freshservice.

## Support

For questions or issues, please contact the development team.
