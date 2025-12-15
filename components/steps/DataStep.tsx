'use client'

import { useState } from 'react'
import { useWizard } from '@/contexts/WizardContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CURRENCY_SYMBOLS } from '@/types'

export default function DataStep() {
  const { state, updateAgentData, nextStep, previousStep } = useWizard()
  const { agentData, opportunity } = state

  const [agentCount, setAgentCount] = useState(agentData.agentCount?.toString() || '')
  const [itAgents, setItAgents] = useState(agentData.itAgents?.toString() || '')
  const [esmAgents, setEsmAgents] = useState(agentData.esmAgents?.toString() || '')

  // For EX: Allow direct input or total volume breakdown
  const [totalTicketVolume, setTotalTicketVolume] = useState('')
  const [annualIncidents, setAnnualIncidents] = useState(
    agentData.annualIncidents?.toString() || ''
  )
  const [annualServiceRequests, setAnnualServiceRequests] = useState(
    agentData.annualServiceRequests?.toString() || ''
  )
  const [individualAgentExpense, setIndividualAgentExpense] = useState(
    agentData.individualAgentExpense?.toString() || ''
  )
  const [currentLicensing, setCurrentLicensing] = useState(
    agentData.currentLicensing?.toString() || ''
  )
  const [currentMaintenance, setCurrentMaintenance] = useState(
    agentData.currentMaintenance?.toString() || ''
  )

  const currencySymbol = opportunity.localCurrency
    ? CURRENCY_SYMBOLS[opportunity.localCurrency]
    : '$'

  const handleContinue = () => {
    // Calculate agent count based on ESM selection
    const itAgentsParsed = parseInt(itAgents) || 0
    const esmAgentsParsed = parseInt(esmAgents) || 0
    const totalAgentCount = opportunity.esm
      ? itAgentsParsed + esmAgentsParsed
      : parseInt(agentCount) || 0

    const data = {
      agentCount: totalAgentCount,
      itAgents: opportunity.esm ? itAgentsParsed : undefined,
      esmAgents: opportunity.esm ? esmAgentsParsed : undefined,
      annualIncidents: parseInt(annualIncidents) || 0,
      annualServiceRequests: parseInt(annualServiceRequests) || 0,
      individualAgentExpense: parseInt(individualAgentExpense) || 0,
      currentLicensing: parseInt(currentLicensing) || 0,
      currentMaintenance: parseInt(currentMaintenance) || 0,
    }

    // Agent count and individual agent expense must be greater than 0
    // Other expense fields can be 0
    if (data.agentCount === 0) {
      alert('Agent count is required and must be greater than 0')
      return
    }

    if (data.individualAgentExpense === 0) {
      alert('Individual Agent expense must be greater than 0')
      return
    }

    updateAgentData(data)
    nextStep()
  }

  const isFormValid = opportunity.esm
    ? itAgents &&
      esmAgents &&
      annualIncidents !== '' &&
      (opportunity.product === 'CX' || annualServiceRequests !== '') &&
      individualAgentExpense &&
      currentLicensing !== '' &&
      currentMaintenance !== ''
    : agentCount &&
      annualIncidents !== '' &&
      (opportunity.product === 'CX' || annualServiceRequests !== '') &&
      individualAgentExpense &&
      currentLicensing !== '' &&
      currentMaintenance !== ''

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Collection</h2>
        <p className="text-gray-600">
          Please provide specific data points about your organization. All currency values
          are in {opportunity.localCurrency || 'your selected currency'}.
        </p>
      </div>

      {/* Agent Details */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
        {opportunity.esm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="IT Agents"
              type="number"
              value={itAgents}
              onChange={(e) => setItAgents(e.target.value)}
              placeholder="e.g., 150"
              min="0"
              helperText="Number of IT service desk agents"
            />
            <Input
              label="ESM Agents"
              type="number"
              value={esmAgents}
              onChange={(e) => setEsmAgents(e.target.value)}
              placeholder="e.g., 50"
              min="0"
              helperText="Number of ESM agents (HR, Facilities, etc.)"
            />
            <div className="col-span-1 md:col-span-2 bg-blue-100 border border-blue-300 rounded p-3">
              <p className="text-sm text-blue-900">
                <strong>Total Agents:</strong> {(parseInt(itAgents) || 0) + (parseInt(esmAgents) || 0)}
              </p>
            </div>
          </div>
        ) : (
          <Input
            label="How Many Agents?"
            type="number"
            value={agentCount}
            onChange={(e) => setAgentCount(e.target.value)}
            placeholder="e.g., 200"
            min="1"
          />
        )}
      </div>

      {/* Annual Volume */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Volume</h3>
        {opportunity.product === 'CX' ? (
          // CX: Show single "Cases" field
          <Input
            label="Annual Cases"
            type="number"
            value={annualIncidents}
            onChange={(e) => {
              setAnnualIncidents(e.target.value)
              setAnnualServiceRequests('0') // Set service requests to 0 for CX
            }}
            placeholder="e.g., 100000"
            min="0"
            helperText="Total annual customer cases"
          />
        ) : (
          // EX: Total Volume with 60/40 split option
          <div className="space-y-4">
            <Input
              label="Total Annual Ticket Volume"
              type="number"
              value={totalTicketVolume}
              onChange={(e) => {
                const total = parseInt(e.target.value) || 0
                setTotalTicketVolume(e.target.value)
                // Auto-calculate 40% Incidents, 60% Service Requests
                setAnnualIncidents(Math.round(total * 0.4).toString())
                setAnnualServiceRequests(Math.round(total * 0.6).toString())
              }}
              placeholder="e.g., 100000"
              min="0"
              helperText="Enter total volume to auto-calculate breakdown (40% Incidents, 60% Service Requests)"
            />

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Suggested Breakdown (editable):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Incidents (40%)"
                  type="number"
                  value={annualIncidents}
                  onChange={(e) => setAnnualIncidents(e.target.value)}
                  placeholder="e.g., 40000"
                  min="0"
                  helperText="Adjust if needed"
                />
                <Input
                  label="Service Requests (60%)"
                  type="number"
                  value={annualServiceRequests}
                  onChange={(e) => setAnnualServiceRequests(e.target.value)}
                  placeholder="e.g., 60000"
                  min="0"
                  helperText="Adjust if needed"
                />
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <strong>Total:</strong> {(parseInt(annualIncidents) || 0) + (parseInt(annualServiceRequests) || 0)} tickets
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Annual Existing Expenses */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Annual Existing Expenses ({currencySymbol})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={`Individual Agent (${currencySymbol})`}
            type="number"
            value={individualAgentExpense}
            onChange={(e) => setIndividualAgentExpense(e.target.value)}
            placeholder="e.g., 60000"
            min="0"
          />
          <Input
            label={`Current Licensing (${currencySymbol})`}
            type="number"
            value={currentLicensing}
            onChange={(e) => setCurrentLicensing(e.target.value)}
            placeholder="e.g., 275000"
            min="0"
          />
          <Input
            label={`Current Maintenance (${currencySymbol})`}
            type="number"
            value={currentMaintenance}
            onChange={(e) => setCurrentMaintenance(e.target.value)}
            placeholder="e.g., 20000"
            min="0"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button onClick={previousStep} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!isFormValid} size="lg">
          Continue to Verify
        </Button>
      </div>
    </div>
  )
}
