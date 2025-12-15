'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '@/contexts/WizardContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CURRENCY_SYMBOLS } from '@/types'
import { DEFAULT_UNIT_PRICES, FREDDY_COPILOT_PRICE_PER_AGENT } from '@/lib/data'

export default function VerifyStep() {
  const { state, updatePricing, nextStep, previousStep } = useWizard()
  const { opportunity, agentData, pricing } = state

  const [unitPriceInput, setUnitPriceInput] = useState(
    pricing.unitPrice?.toString() || ''
  )
  const [implementationPriceInput, setImplementationPriceInput] = useState(
    pricing.implementationPrice?.toString() || ''
  )
  const [premiumSupportInput, setPremiumSupportInput] = useState(
    pricing.premiumSupportPrice?.toString() || '0'
  )
  const [otherCostsInput, setOtherCostsInput] = useState(
    pricing.otherCosts?.toString() || '0'
  )

  const currencySymbol = opportunity.localCurrency
    ? CURRENCY_SYMBOLS[opportunity.localCurrency]
    : '$'

  // Initialize default unit price (implementation price should always be user-entered)
  useEffect(() => {
    if (opportunity.plan && !unitPriceInput) {
      const defaultUnit = DEFAULT_UNIT_PRICES[opportunity.plan] || 0
      setUnitPriceInput(defaultUnit.toString())
      // Don't auto-fill implementation price - user must enter it
    }
  }, [opportunity.plan, unitPriceInput])

  const baseUnitPrice = parseInt(unitPriceInput) || 0

  // Add Freddy Co-Pilot pricing if enabled
  const freddyPrice = opportunity.freddyCoPilot ? FREDDY_COPILOT_PRICE_PER_AGENT : 0
  const totalUnitPrice = baseUnitPrice + freddyPrice

  const implementationPrice = parseInt(implementationPriceInput) || 0
  const premiumSupportPrice = parseInt(premiumSupportInput) || 0
  const otherCosts = parseInt(otherCostsInput) || 0

  const totalAgents = agentData.agentCount || 0
  const annualLicenseCost = totalUnitPrice * totalAgents
  const totalCosts = annualLicenseCost + implementationPrice + premiumSupportPrice + otherCosts

  const handleContinue = () => {
    if (!totalUnitPrice) {
      alert('Please provide a valid unit price per agent')
      return
    }

    updatePricing({
      pricingType: 'List',
      unitPrice: totalUnitPrice,
      implementationPrice: implementationPrice,
      premiumSupportPrice: premiumSupportPrice,
      otherCosts: otherCosts,
    })

    nextStep()
  }

  const getSummaryText = () => {
    const engagementText = opportunity.engagement === 'New' ? 'new prospect' : 'existing customer'
    const product = opportunity.product || 'a product'
    const plan = opportunity.plan || 'a plan'
    const currency = opportunity.localCurrency || 'USD'
    const agents = totalAgents

    return `This is a ${engagementText} evaluating ${product} on the ${plan} plan. Their local currency is ${currency}. This ${
      opportunity.engagement === 'New' ? 'prospect' : 'customer'
    } has ${agents} total agents.`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Information</h2>
        <p className="text-gray-600">
          Review your entries and configure pricing details.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
        <p className="text-gray-700">{getSummaryText()}</p>
      </div>

      {/* Pricing Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pricing Details</h3>

        {/* Configuration Summary */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Product:</span>
              <p className="font-semibold text-gray-900">{opportunity.product || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Plan:</span>
              <p className="font-semibold text-gray-900">{opportunity.plan || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Agents:</span>
              <p className="font-semibold text-gray-900">{totalAgents}</p>
            </div>
            <div>
              <span className="text-gray-600">Currency:</span>
              <p className="font-semibold text-gray-900">{currencySymbol} {opportunity.localCurrency || 'USD'}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Cost Line Items</h4>
          </div>

          <div className="p-6 space-y-6">
            {/* Annual License Costs */}
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <h5 className="font-medium text-gray-900">Annual License Costs</h5>
                <span className="text-sm text-gray-500">Per agent × {totalAgents} agents</span>
              </div>

              <Input
                label={`Base Price per Agent/Year (${currencySymbol})`}
                type="number"
                value={unitPriceInput}
                onChange={(e) => setUnitPriceInput(e.target.value)}
                min="0"
                placeholder="e.g., 588"
                helperText="Annual list price per agent"
              />

              {opportunity.freddyCoPilot && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <p className="text-sm text-yellow-900">
                    <strong>Freddy Co-Pilot:</strong> +{currencySymbol}{freddyPrice}/agent/year
                  </p>
                  <p className="text-sm text-yellow-900 mt-1">
                    <strong>Total per agent:</strong> {currencySymbol}{totalUnitPrice}/year
                  </p>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-700">Annual License Subtotal</p>
                <p className="text-2xl font-bold text-blue-700">
                  {currencySymbol}{annualLicenseCost.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {totalAgents} agents × {currencySymbol}{totalUnitPrice.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h5 className="font-medium text-gray-900 mb-3">Additional Costs</h5>
              <div className="space-y-4">
                {/* Implementation Costs */}
                <Input
                  label={`Implementation Costs (${currencySymbol})`}
                  type="number"
                  value={implementationPriceInput}
                  onChange={(e) => setImplementationPriceInput(e.target.value)}
                  min="0"
                  placeholder="0"
                  helperText="One-time implementation and onboarding costs (Year 1 only)"
                />

                {/* Premium Support */}
                <Input
                  label={`Premium Support (${currencySymbol})`}
                  type="number"
                  value={premiumSupportInput}
                  onChange={(e) => setPremiumSupportInput(e.target.value)}
                  min="0"
                  placeholder="0"
                  helperText="Optional: Annual premium support costs"
                />

                {/* Other Costs */}
                <Input
                  label={`Other Costs (${currencySymbol})`}
                  type="number"
                  value={otherCostsInput}
                  onChange={(e) => setOtherCostsInput(e.target.value)}
                  min="0"
                  placeholder="0"
                  helperText="Optional: Any other annual costs (training, consulting, etc.)"
                />
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-green-50 border-t-2 border-green-300 p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Annual License:</span>
                <span className="font-medium">{currencySymbol}{annualLicenseCost.toLocaleString()}</span>
              </div>
              {implementationPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Implementation (Year 1):</span>
                  <span className="font-medium">{currencySymbol}{implementationPrice.toLocaleString()}</span>
                </div>
              )}
              {premiumSupportPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Premium Support:</span>
                  <span className="font-medium">{currencySymbol}{premiumSupportPrice.toLocaleString()}</span>
                </div>
              )}
              {otherCosts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Other Costs:</span>
                  <span className="font-medium">{currencySymbol}{otherCosts.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-green-300 pt-2 mt-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-gray-900">Total Year 1 Cost:</span>
                  <span className="text-3xl font-bold text-green-700">
                    {currencySymbol}{totalCosts.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p className="text-sm text-gray-700">
          If these values are correct, please click <strong>Continue</strong> to proceed.
          Otherwise, please review your earlier entries or adjust the pricing above.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={previousStep} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} size="lg">
          Continue to Maturity
        </Button>
      </div>
    </div>
  )
}
