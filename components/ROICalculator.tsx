'use client'

import { WizardProvider, useWizard } from '@/contexts/WizardContext'
import WizardTabs from './WizardTabs'
import OpportunityStep from './steps/OpportunityStep'
import DataStep from './steps/DataStep'
import VerifyStep from './steps/VerifyStep'
import MaturityStep from './steps/MaturityStep'
import EnhancedResultsStep from './steps/EnhancedResultsStep'

function WizardContent() {
  const { currentStep, setCurrentStep } = useWizard()

  const renderStep = () => {
    switch (currentStep) {
      case 'opportunity':
        return <OpportunityStep />
      case 'data':
        return <DataStep />
      case 'verify':
        return <VerifyStep />
      case 'maturity':
        return <MaturityStep />
      case 'results':
        return <EnhancedResultsStep />
      default:
        return <OpportunityStep />
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
          <h1 className="text-3xl font-bold text-white text-center">
            Freshservice Self-Service ROI Calculator
          </h1>
          <p className="mt-2 text-center text-primary-100">
            Calculate your return on investment in just a few steps
          </p>
        </div>

        {/* Tabs */}
        <WizardTabs currentStep={currentStep} onStepClick={setCurrentStep} />

        {/* Step Content */}
        <div className="p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default function ROICalculator() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
