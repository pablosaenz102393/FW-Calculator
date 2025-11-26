'use client'

import { WizardStep } from '@/types'
import { cn } from '@/lib/utils'

interface WizardTabsProps {
  currentStep: WizardStep
  onStepClick: (step: WizardStep) => void
}

const STEPS: { value: WizardStep; label: string; number: number }[] = [
  { value: 'opportunity', label: 'Opportunity', number: 1 },
  { value: 'data', label: 'Data', number: 2 },
  { value: 'verify', label: 'Verify', number: 3 },
  { value: 'maturity', label: 'Maturity', number: 4 },
  { value: 'results', label: 'Results', number: 5 },
]

export default function WizardTabs({ currentStep, onStepClick }: WizardTabsProps) {
  const currentIndex = STEPS.findIndex(step => step.value === currentStep)

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <nav className="flex justify-center space-x-8 px-6" aria-label="Tabs">
        {STEPS.map((step, index) => {
          const isActive = step.value === currentStep
          const isCompleted = index < currentIndex
          const isAccessible = index <= currentIndex

          return (
            <button
              key={step.value}
              onClick={() => isAccessible && onStepClick(step.value)}
              disabled={!isAccessible}
              className={cn(
                'relative py-4 px-1 text-sm font-medium transition-colors whitespace-nowrap',
                'focus:outline-none',
                isActive
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : isCompleted
                  ? 'text-gray-700 hover:text-gray-900 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              )}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? '✓' : step.number}
                </span>
                <span>{step.label}</span>
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
