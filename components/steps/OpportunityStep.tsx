'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWizard } from '@/contexts/WizardContext'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import {
  PRODUCTS,
  ENGAGEMENT_TYPES,
  CURRENCIES,
  getPlansForEngagement,
} from '@/lib/data'
import { Product, EngagementType, Plan, Currency } from '@/types'

export default function OpportunityStep() {
  const { state, updateOpportunity, nextStep } = useWizard()
  const { opportunity } = state

  const [opportunityId, setOpportunityId] = useState(opportunity.opportunityId || '')
  const [product, setProduct] = useState<Product | ''>(opportunity.product || '')
  const [engagement, setEngagement] = useState<EngagementType | ''>(
    opportunity.engagement || ''
  )
  const [plan, setPlan] = useState<Plan | ''>(opportunity.plan || '')
  const [localCurrency, setLocalCurrency] = useState<Currency | ''>(
    opportunity.localCurrency || ''
  )
  const [esm, setEsm] = useState(opportunity.esm || false)
  const [freddyCoPilot, setFreddyCoPilot] = useState(opportunity.freddyCoPilot || false)

  // Get available plans based on engagement type
  const availablePlans = useMemo(
    () => (engagement ? getPlansForEngagement(engagement) : []),
    [engagement]
  )

  // Reset plan when engagement changes
  useEffect(() => {
    if (engagement && plan) {
      const validPlan = availablePlans.find(p => p.value === plan)
      if (!validPlan) {
        setPlan('')
      }
    }
  }, [engagement, plan, availablePlans])

  // Reset ESM when CX product is selected
  useEffect(() => {
    if (product === 'CX' && esm) {
      setEsm(false)
    }
  }, [product, esm])

  // Reset Freddy Co-Pilot when plan is not Pro or Enterprise
  useEffect(() => {
    const isProrOrEnterprise = plan === 'Pro' || plan === 'Enterprise' || plan === 'Pro to Enterprise'
    if (!isProrOrEnterprise && freddyCoPilot) {
      setFreddyCoPilot(false)
    }
  }, [plan, freddyCoPilot])

  const handleContinue = () => {
    if (!product || !engagement || !plan || !localCurrency) {
      alert('Please fill in all required fields')
      return
    }

    updateOpportunity({
      opportunityId: opportunityId || undefined,
      product: product as Product,
      engagement: engagement as EngagementType,
      plan: plan as Plan,
      localCurrency: localCurrency as Currency,
      esm,
      freddyCoPilot,
    })

    nextStep()
  }

  const isFormValid = product && engagement && plan && localCurrency

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Opportunity Details</h2>
        <p className="text-gray-600">
          Let&apos;s start by gathering some basic information about your opportunity.
        </p>
      </div>

      {/* Opportunity ID for Salesforce tracking */}
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <Input
          label="Opportunity ID (Optional)"
          value={opportunityId}
          onChange={(e) => setOpportunityId(e.target.value)}
          placeholder="e.g., SF-12345"
          helperText="Salesforce Opportunity ID for tracking calculator usage"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product */}
        <Select
          label="Product"
          value={product}
          onChange={(e) => setProduct(e.target.value as Product)}
          options={PRODUCTS}
        />

        {/* Engagement */}
        <Select
          label="Engagement"
          value={engagement}
          onChange={(e) => {
            setEngagement(e.target.value as EngagementType)
            setPlan('') // Reset plan when engagement changes
          }}
          options={ENGAGEMENT_TYPES}
        />

        {/* Plan */}
        <Select
          label="Plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value as Plan)}
          options={availablePlans}
          disabled={!engagement}
        />

        {/* Local Currency */}
        <Select
          label="Local Currency"
          value={localCurrency}
          onChange={(e) => setLocalCurrency(e.target.value as Currency)}
          options={CURRENCIES}
        />

        {/* ESM - Only for EX */}
        {product === 'EX' && (
          <Select
            label="ESM (Enterprise Service Management)"
            value={esm ? 'Yes' : 'No'}
            onChange={(e) => setEsm(e.target.value === 'Yes')}
            options={[
              { value: 'No', label: 'No ESM' },
              { value: 'Yes', label: 'Include ESM' },
            ]}
          />
        )}

        {/* Freddy Co-Pilot - Only for Pro and Enterprise */}
        {(plan === 'Pro' || plan === 'Enterprise' || plan === 'Pro to Enterprise') && (
          <Select
            label="Freddy Co-Pilot (AI Assistant)"
            value={freddyCoPilot ? 'Yes' : 'No'}
            onChange={(e) => setFreddyCoPilot(e.target.value === 'Yes')}
            options={[
              { value: 'No', label: 'No Freddy Co-Pilot' },
              { value: 'Yes', label: 'Include Freddy Co-Pilot' },
            ]}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleContinue}
          disabled={!isFormValid}
          size="lg"
        >
          Continue to Data
        </Button>
      </div>
    </div>
  )
}
