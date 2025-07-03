import type { IncidentFormData } from "@/types"
import { initialIncidentFormData } from "@/lib/constants"

export async function submitIncident(accountInfoData: IncidentFormData, verificationData?: any): Promise<{ caseId: string }> {
  const endpoint = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents`
    : "https://mp065sy261.execute-api.us-east-1.amazonaws.com/Prod/incidents_create" // fallback (optional)

  const dynamicExtras: Record<string, any> = {}
  Object.entries(accountInfoData).forEach(([key, value]) => {
    if (!(key in initialIncidentFormData) && key !== "evidenceFiles") {
      dynamicExtras[key] = value
    }
  })

  const payload = {
    firstName: accountInfoData.firstName,
    lastName:  accountInfoData.lastName,
    emailAddress: accountInfoData.emailAddress,

    primaryHarmType: accountInfoData.primaryHarmType,
    incidentClassification: accountInfoData.incidentClassification ?? undefined,

    country:  accountInfoData.country,
    city:     accountInfoData.city ?? undefined,
    culturalContext: accountInfoData.culturalContext ?? undefined,

    violationReason: accountInfoData.violationReason,
    violationCode:   accountInfoData.violationCode ?? undefined,
    typeOfSupportProvided: accountInfoData.typeOfSupportProvided ?? undefined,

    affectedPlatforms: accountInfoData.affectedPlatforms,

    hackedElsewhere: accountInfoData.hackedElsewhere ?? undefined,
    hackedElsewhereDetails: accountInfoData.hackedElsewhereDetails ?? undefined,
    crossPlatformDetails:   accountInfoData.crossPlatformDetails ?? undefined,

    platformForDynamicQuestions: accountInfoData.platformForDynamicQuestions ?? undefined,
    ...dynamicExtras,

    evidenceUrls: [], // can be populated if needed
    sumSubVerificationId: verificationData?.verificationId || "simulated_verification_id",
  }

  // Clean null/undefined/empty-string values
  Object.keys(payload).forEach((key) => {
    const K = key as keyof typeof payload
    if (payload[K] === undefined || payload[K] === "") {
      delete payload[K]
    }
  })

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}.`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {}
    throw new Error(errorMessage)
  }

  const result = await response.json()
  return { caseId: result.caseId || `CASE-SIM-${Date.now().toString().slice(-5)}` }
}
