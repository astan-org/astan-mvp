"use client"                             /* ① make it a client component */

import { Loader2, AlertCircle } from "lucide-react"

/* UI wrappers */
import DashboardLayout        from "@/components/layout/dashboard-layout"
import HomePage               from "@/components/home-page"
import AddRequestPage         from "@/components/incident-form/add-request-page"
import DeferToPlatform        from "@/components/defer-to-platform"
import SumSubIntegration      from "@/components/identity-verification/sumsub-integration"
import ConfirmationPage       from "@/components/confirmation-page"
import { Alert, AlertTitle, AlertDescription }
                             from "@/components/ui/alert"

/* state machine hook we extracted in Step 1 */
import { useIncidentFlow }    from "@/hooks/useIncidentFlow"

export default function IncidentFlowPage() {
  /* ------------------- values & handlers from the hook ------------------- */
  const {
    currentStep,
    isLoading,
    caseId,
    submissionError,
    handleStartReport,
    handleAccountInfoSubmit,
    handleDeferToPlatform,
    handleGoBackFromDefer,
    handleVerificationComplete,
    accountInfoData,
  } = useIncidentFlow()

  /* ------------------- helper to pick which screen to show --------------- */
  const renderStepContent = () => {
    switch (currentStep) {
      case "SHOWING_HOMEPAGE":
        return <HomePage onStartReport={handleStartReport} />

      case "FILLING_ACCOUNT_INFO":
        return (
          <AddRequestPage
            onSubmitAccountInfo={handleAccountInfoSubmit}
            onDeferToPlatform={handleDeferToPlatform}
            initialData={accountInfoData ?? undefined}
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
        /* isLoading is optional now, but keep spinner for safety */
        return (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Submitting your report…</h2>
            <p className="text-muted-foreground">
              Please wait while we securely submit your information.
            </p>
          </div>
        )

      case "SHOWING_CONFIRMATION":
        return <ConfirmationPage caseId={caseId} onGoHome={handleStartReport} />

      /* ⬇️ never forget a default */
      default:
        return <HomePage onStartReport={handleStartReport} />
    }
  }

  /* ------------------- final render wrapped in the dashboard shell ------- */
  return (
    <DashboardLayout currentStep={currentStep}>
      {renderStepContent()}
    </DashboardLayout>
  )
}
