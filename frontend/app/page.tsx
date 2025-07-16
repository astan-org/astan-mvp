"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "react-oidc-context";

import DashboardLayout from "@/components/layout/dashboard-layout";
import HomePage from "@/components/home-page";
import AddRequestPage from "@/components/incident-form/add-request-page";
import DeferToPlatform from "@/components/defer-to-platform";
import SumSubIntegration from "@/components/identity-verification/sumsub-integration";
import ConfirmationPage from "@/components/confirmation-page";
import { useEffect } from "react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { useIncidentFlow } from "@/hooks/useIncidentFlow";

export default function IncidentFlowPage() {
  const auth = useAuth();

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
  } = useIncidentFlow();


  useEffect(() => {
  if (auth.isAuthenticated && auth.user?.access_token) {
    localStorage.setItem("accessToken", auth.user.access_token);
  }
}, [auth.isAuthenticated, auth.user]);


  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Alert variant="destructive">
          <AlertTitle>Auth Error</AlertTitle>
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">
          You must be signed in to access this page.
        </h2>
        <Button onClick={() => auth.signinRedirect()}>Login</Button>
      </div>
    );
  }



  const renderStepContent = () => {
    switch (currentStep) {
      case "SHOWING_HOMEPAGE":
        return <HomePage onStartReport={handleStartReport} />;
      case "FILLING_ACCOUNT_INFO":
        return (
          <AddRequestPage
            onSubmitAccountInfo={handleAccountInfoSubmit}
            onDeferToPlatform={handleDeferToPlatform}
            initialData={accountInfoData ?? undefined}
          />
        );
      case "DEFER_TO_PLATFORM":
        return <DeferToPlatform onGoBack={handleGoBackFromDefer} />;
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
        );
      case "SUBMITTING_INCIDENT":
        return (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Submitting your report…</h2>
            <p className="text-muted-foreground">
              Please wait while we securely submit your information.
            </p>
          </div>
        );
      case "SHOWING_CONFIRMATION":
        return <ConfirmationPage caseId={caseId} onGoHome={handleStartReport} />;
      default:
        return <HomePage onStartReport={handleStartReport} />;
    }
  };

  return (
    <DashboardLayout currentStep={currentStep}>
      {renderStepContent()}
    </DashboardLayout>
  );
}
