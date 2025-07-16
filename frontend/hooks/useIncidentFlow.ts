// hooks/useIncidentFlow.ts
"use client";

import { useState } from "react";
import type { AppStep, IncidentFormData } from "@/types";
import { initialIncidentFormData } from "@/lib/constants";
import { uploadEvidenceFile } from "@/lib/api/s3-upload";
import { submitIncident } from "@/lib/api/submitIncident";

export function useIncidentFlow() {
  /* -------- state -------- */
  const [currentStep, setCurrentStep] = useState<AppStep>("SHOWING_HOMEPAGE");
  const [accountInfoData, setAccountInfoData] = useState<IncidentFormData | null>(
    null
  );
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  

  /* -------- helpers -------- */
  function handleStartReport() {
    setCurrentStep("FILLING_ACCOUNT_INFO");
    setAccountInfoData({ ...initialIncidentFormData });
    setSubmissionError(null);
    setCaseId(null);
  }

  function handleAccountInfoSubmit(data: IncidentFormData) {
    setAccountInfoData(data);
    setCurrentStep("PENDING_ID_VERIFICATION");
  }

  function handleDeferToPlatform() {
    setCurrentStep("DEFER_TO_PLATFORM");
  }

  function handleGoBackFromDefer() {
    setCurrentStep("FILLING_ACCOUNT_INFO");
  }

  /* -------- main flow -------- */
  async function handleVerificationComplete(
    success: boolean,
    verificationData?: any
  ) {
    if (!success) {
      setSubmissionError(
        `Identity verification failed${
          verificationData?.reason ? `: ${verificationData.reason}` : ""
        }.`
      );
      setCurrentStep("PENDING_ID_VERIFICATION");
      return;
    }

    if (!accountInfoData) {
      setSubmissionError("Critical error: Account information is missing.");
      setCurrentStep("FILLING_ACCOUNT_INFO");
      return;
    }

    setIsLoading(true);
    setCurrentStep("SUBMITTING_INCIDENT");
    setSubmissionError(null);

    try {
      /* 1️⃣  upload every selected evidence file (if any) */
      const evidenceUploads = await Promise.all(
        (accountInfoData.evidenceFiles ?? []).map((file) =>
          uploadEvidenceFile(file)
        )
      );
      const evidenceFileKeys = evidenceUploads.map((u) => u.fileKey); // ["incident-123/IMG_1.png", …]

      /* 2️⃣  strip the File[] and build clean payload */
      const payloadForApi = {
        ...accountInfoData,
        evidenceFileKeys,
        evidenceFiles: undefined, // remove the big File objects
      };

      /* 3️⃣  hit backend */
      const { caseId } = await submitIncident(payloadForApi, verificationData);
      setCaseId(caseId);
      setCurrentStep("SHOWING_CONFIRMATION");
    } catch (err: any) {
      setSubmissionError(
        err?.message || "Unexpected error during submission."
      );
      setCurrentStep("PENDING_ID_VERIFICATION");
    } finally {
      setIsLoading(false);
    }
  }

  /* -------- what the UI needs -------- */
  return {
    currentStep,
    accountInfoData,
    submissionError,
    caseId,
    isLoading,

    handleStartReport,
    handleAccountInfoSubmit,
    handleDeferToPlatform,
    handleGoBackFromDefer,
    handleVerificationComplete,
  };
}
