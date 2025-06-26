"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import HomePage from "@/components/home-page"
import AddRequestPage from "@/components/incident-form/add-request-page"
import SumSubIntegration from "@/components/identity-verification/sumsub-integration"
import ConfirmationPage from "@/components/confirmation-page"
import DeferToPlatform from "@/components/defer-to-platform"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

import type { IncidentFormData, AppStep } from "@/types"
import { initialIncidentFormData } from "@/lib/constants"

export default function MainMultiStepFlowPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>("SHOWING_HOMEPAGE")
  const [accountInfoData, setAccountInfoData] = useState<IncidentFormData | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartReport = () => {
    setCurrentStep("FILLING_ACCOUNT_INFO")
    setAccountInfoData(initialIncidentFormData)
    setSubmissionError(null)
    setCaseId(null)
  }

  const handleAccountInfoSubmit = (data: IncidentFormData) => {
    setAccountInfoData(data)
    setCurrentStep("PENDING_ID_VERIFICATION")
  }

  const handleDeferToPlatform = () => {
    setCurrentStep("DEFER_TO_PLATFORM")
  }

  const handleGoBackFromDefer = () => {
    setCurrentStep("FILLING_ACCOUNT_INFO")
  }

  const handleVerificationComplete = async (success: boolean, verificationData?: any) => {
    if (success) {
      setCurrentStep("SUBMITTING_INCIDENT")
      setIsLoading(true)
      setSubmissionError(null)

      if (!accountInfoData) {
        setSubmissionError("Critical error: Account information is missing.")
        setCurrentStep("FILLING_ACCOUNT_INFO")
        setIsLoading(false)
        return
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) {
        console.error("API base URL is not configured in .env.local (NEXT_PUBLIC_API_BASE_URL).")
        setSubmissionError("Application error: API endpoint is not configured. Please contact support.")
        setCurrentStep("PENDING_ID_VERIFICATION")
        setIsLoading(false)
        return
      }

      const evidenceUrls = accountInfoData.evidenceFiles.map((file) => `https://example.com/uploads/${file.name}`)

      const dynamicData: Record<string, any> = {}
      Object.keys(accountInfoData).forEach((key) => {
        if (!initialIncidentFormData.hasOwnProperty(key) && key !== "evidenceFiles") {
          dynamicData[key] = accountInfoData[key]
        }
      })

      const payload = {
        firstName: accountInfoData.firstName,
        lastName: accountInfoData.lastName,
        email: accountInfoData.emailAddress,
        typeOfRequest: accountInfoData.primaryHarmType,
        affectedPlatforms: accountInfoData.affectedPlatforms,
        evidenceUrls: evidenceUrls,
        description: accountInfoData.violationReason,
        ...dynamicData,
        country: accountInfoData.country,
        city: accountInfoData.city,
        violationCode: accountInfoData.violationCode,
        secondaryClassification: accountInfoData.incidentClassification,
        supportProvided: accountInfoData.typeOfSupportProvided,
        culturalContext: accountInfoData.culturalContext,
        sumSubVerificationId: verificationData?.verificationId || "simulated_verification_id",
        hackedElsewhere: accountInfoData.hackedElsewhere,
        hackedElsewhereDetails: accountInfoData.hackedElsewhereDetails,
        crossPlatformDetails: accountInfoData.crossPlatformDetails,
      }
      Object.keys(payload).forEach((key) => {
        const K = key as keyof typeof payload
        if (payload[K] === undefined || payload[K] === "") {
          delete payload[K]
        }
      })

      try {
        const response = await fetch(`${apiBaseUrl}/submit-incident`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          let errorResponseMessage = `Server responded with ${response.status}.`
          try {
            const errorData = await response.json()
            errorResponseMessage = errorData.message || errorData.error || errorResponseMessage
          } catch (parseError) {
            errorResponseMessage = response.statusText || errorResponseMessage
          }
          throw new Error(errorResponseMessage)
        }

        const responseData = await response.json()
        setCaseId(responseData.caseId || `CASE-SIM-${Date.now().toString().slice(-5)}`)
        setCurrentStep("SHOWING_CONFIRMATION")
      } catch (err: any) {
        setSubmissionError(err.message || "An unexpected error occurred during submission.")
        setCurrentStep("PENDING_ID_VERIFICATION")
      } finally {
        setIsLoading(false)
      }
    } else {
      setSubmissionError(
        "Identity verification failed. Please try again or contact support. Reason: " +
          (verificationData?.reason || "Unknown"),
      )
      setCurrentStep("PENDING_ID_VERIFICATION")
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "SHOWING_HOMEPAGE":
        return <HomePage onStartReport={handleStartReport} />
      case "FILLING_ACCOUNT_INFO":
        return (
          <AddRequestPage
            onSubmitAccountInfo={handleAccountInfoSubmit}
            onDeferToPlatform={handleDeferToPlatform}
            initialData={accountInfoData || undefined}
          />
        )
      case "DEFER_TO_PLATFORM":
        return <DeferToPlatform onGoBack={handleGoBackFromDefer} />
      case "PENDING_ID_VERIFICATION":
        return (
          <div className="flex flex-col items-center justify-center">
            {submissionError && (
              <Alert variant="destructive" className="mb-6 max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{submissionError}</AlertDescription>
              </Alert>
            )}
            <SumSubIntegration onVerificationComplete={handleVerificationComplete} />
          </div>
        )
      case "SUBMITTING_INCIDENT":
        return (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Submitting Your Report...</h2>
            <p className="text-muted-foreground">Please wait while we securely submit your information.</p>
          </div>
        )
      case "SHOWING_CONFIRMATION":
        return <ConfirmationPage caseId={caseId} onGoHome={handleStartReport} />
      default:
        return <HomePage onStartReport={handleStartReport} />
    }
  }

  return <DashboardLayout currentStep={currentStep}>{renderStepContent()}</DashboardLayout>
}
