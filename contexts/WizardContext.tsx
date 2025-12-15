'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  WizardState,
  WizardStep,
  OpportunityData,
  AgentData,
  PricingData,
  MaturityData,
  ResultsData,
  ComponentData,
  AdvancedConfig,
} from '@/types'

interface WizardContextType {
  state: WizardState
  currentStep: WizardStep
  setCurrentStep: (step: WizardStep) => void
  updateOpportunity: (data: Partial<OpportunityData>) => void
  updateAgentData: (data: Partial<AgentData>) => void
  updatePricing: (data: Partial<PricingData>) => void
  updateMaturity: (data: Partial<MaturityData>) => void
  updateComponentData: (data: Partial<ComponentData>) => void
  updateAdvancedConfig: (data: Partial<AdvancedConfig>) => void
  updateResults: (data: Partial<ResultsData>) => void
  nextStep: () => void
  previousStep: () => void
  resetWizard: () => void
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

const STEPS: WizardStep[] = ['opportunity', 'data', 'verify', 'maturity', 'results']

const initialState: WizardState = {
  currentStep: 'opportunity',
  opportunity: {},
  agentData: {},
  pricing: {},
  maturity: {},
  componentData: {},
  advancedConfig: {
    discountRate: 10,
    benefitRealizationFactors: {
      year1: 0.5,
      year2: 0.75,
      year3: 1.0,
    },
    roiGuardrailEnabled: true,
    debugModeEnabled: false,
  },
  results: {},
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState)

  const setCurrentStep = (step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }))
  }

  const updateOpportunity = (data: Partial<OpportunityData>) => {
    setState(prev => ({
      ...prev,
      opportunity: { ...prev.opportunity, ...data },
    }))
  }

  const updateAgentData = (data: Partial<AgentData>) => {
    setState(prev => ({
      ...prev,
      agentData: { ...prev.agentData, ...data },
    }))
  }

  const updatePricing = (data: Partial<PricingData>) => {
    setState(prev => ({
      ...prev,
      pricing: { ...prev.pricing, ...data },
    }))
  }

  const updateMaturity = (data: Partial<MaturityData>) => {
    setState(prev => ({
      ...prev,
      maturity: { ...prev.maturity, ...data },
    }))
  }

  const updateComponentData = (data: Partial<ComponentData>) => {
    setState(prev => ({
      ...prev,
      componentData: { ...prev.componentData, ...data },
    }))
  }

  const updateAdvancedConfig = (data: Partial<AdvancedConfig>) => {
    setState(prev => ({
      ...prev,
      advancedConfig: { ...prev.advancedConfig, ...data },
    }))
  }

  const updateResults = (data: Partial<ResultsData>) => {
    setState(prev => ({
      ...prev,
      results: { ...prev.results, ...data },
    }))
  }

  const nextStep = () => {
    const currentIndex = STEPS.indexOf(state.currentStep)
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }

  const previousStep = () => {
    const currentIndex = STEPS.indexOf(state.currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    }
  }

  const resetWizard = () => {
    setState(initialState)
  }

  return (
    <WizardContext.Provider
      value={{
        state,
        currentStep: state.currentStep,
        setCurrentStep,
        updateOpportunity,
        updateAgentData,
        updatePricing,
        updateMaturity,
        updateComponentData,
        updateAdvancedConfig,
        updateResults,
        nextStep,
        previousStep,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
