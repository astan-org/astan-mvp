import { getAccessToken } from "@/lib/auth"; // your helper
import { IncidentFormData } from "@/types";

export interface SubmitIncidentPayload
  extends Omit<IncidentFormData, "evidenceFiles"> {
  evidenceFileKeys: string[]; // S3 keys returned by uploadEvidenceFile()
}

export async function submitIncident(
  payload: SubmitIncidentPayload,
  verificationData?: any
): Promise<{ caseId: string }> {
  const token = await getAccessToken(); // get the logged-in user's token
  console.log("Token:", token);
  const endpoint = process.env.NEXT_PUBLIC_API_BASE_URL
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/incidents_create`
    : "https://8zo99udgc3.execute-api.us-east-1.amazonaws.com/Prod/incidents_create";

  const bodyToSend: Record<string, any> = {
    ...payload,
    sumSubVerificationId:
      verificationData?.verificationId || "simulated_verification_id",
  };

  Object.keys(bodyToSend).forEach((k) => {
    if (
      bodyToSend[k] === undefined ||
      bodyToSend[k] === null ||
      bodyToSend[k] === ""
    ) {
      delete bodyToSend[k];
    }
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(bodyToSend),
  });

  if (!response.ok) {
    let msg = `Server responded with status ${response.status}`;
    try {
      const errJson = await response.json();
      msg = errJson.error || errJson.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = await response.json();
  return {
    caseId: data.caseId || `CASE-SIM-${Date.now().toString().slice(-5)}`,
  };
}
