// hooks/useIncidentFlow.ts
"use client"
import { useState } from "react"
import type { IncidentFormData, AppStep } from "@/types"
import { initialIncidentFormData } from "@/lib/constants"
import { submitIncident } from "@/lib/api/submitIncident"

export function useIncidentFlow() {
  /* ------------- state ------------- */
  const [currentStep, setCurrentStep] = useState<AppStep>("SHOWING_HOMEPAGE")
  const [accountInfoData, setAccountInfoData] = useState<IncidentFormData | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /* ------------- handlers ------------- */
  function handleStartReport() {
    setCurrentStep("FILLING_ACCOUNT_INFO")
    setAccountInfoData(initialIncidentFormData)
    setSubmissionError(null)
    setCaseId(null)
  }

  function handleAccountInfoSubmit(data: IncidentFormData) {
    setAccountInfoData(data)
    setCurrentStep("PENDING_ID_VERIFICATION")
  }

  function handleDeferToPlatform() {
    setCurrentStep("DEFER_TO_PLATFORM")
  }

  function handleGoBackFromDefer() {
    setCurrentStep("FILLING_ACCOUNT_INFO")
  }

  async function handleVerificationComplete(success: boolean, verificationData?: any) {
    if (!success) {
      setSubmissionError(
        "Identity verification failed. " +
          (verificationData?.reason ? `Reason: ${verificationData.reason}` : ""),
      )
      setCurrentStep("PENDING_ID_VERIFICATION")
      return
    }

    /* ---- happy path ---- */
    if (!accountInfoData) {
      setSubmissionError("Critical error: Account information is missing.")
      setCurrentStep("FILLING_ACCOUNT_INFO")
      return
    }

    setIsLoading(true)
    setCurrentStep("SUBMITTING_INCIDENT")
    setSubmissionError(null)

    try {
      const { caseId } = await submitIncident(accountInfoData, verificationData)
      setCaseId(caseId)
      setCurrentStep("SHOWING_CONFIRMATION")
    } catch (err: any) {
      setSubmissionError(err.message || "Unexpected error during submission.")
      setCurrentStep("PENDING_ID_VERIFICATION")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    /* state the UI cares about */
    currentStep,
    accountInfoData,
    submissionError,
    caseId,
    isLoading,

    /* event handlers */
    handleStartReport,
    handleAccountInfoSubmit,
    handleDeferToPlatform,
    handleGoBackFromDefer,
    handleVerificationComplete,
  }
}