import type { HarmType, PlatformDynamic, IncidentFormData } from "@/types"

export const HARM_TYPES = ["Hacked Account Take over", "Impersonation", "Fraud/Scam"] as const
export const PLATFORMS_DYNAMIC = ["Instagram", "Facebook", "Messenger", "WhatsApp"] as const
export const ALL_PLATFORMS_SELECT = [
  "Instagram",
  "Facebook",
  "Messenger",
  "WhatsApp"
] as const
export const INCIDENT_CLASSIFICATIONS = [
  "Sale of illegal goods",
  "Harassment",
  "Hate Speech",
  "Spam",
  "Nudity",
  "Violence",
  "Scam",
  "False Information",
  "Something else",
] as const

export const FIELD_REQUIREMENTS: Record<HarmType, Partial<Record<PlatformDynamic, string[]>>> = {
  "Hacked Account Take over": {
    Instagram: ["accountUrl", "usedTelcoAuth", "emailUsedToCreate", "newEmailUsedOnMeta"],
    Messenger: ["accountUrl", "usedTelcoAuth", "emailUsedToCreate", "newEmailUsedOnMeta"],
    Facebook: ["accountUrl", "usedTelcoAuth", "emailUsedToCreate", "newEmailUsedOnMeta"],
    WhatsApp: ["victimPhoneNumberWAHack", "usedTelcoAuthWAHack", "emailUsedToCreateWAHack", "newEmailToRecoverWAHack"],
  },
  Impersonation: {
    Instagram: ["realAccountUrl", "fakeAccountUrls", "proofOfRealAccount"],
    Messenger: ["realAccountUrl", "fakeAccountUrls", "proofOfRealAccount"],
    Facebook: ["realAccountUrl", "fakeAccountUrls", "proofOfRealAccount"],
    WhatsApp: ["usedTelcoAuthWAImpersonation"],
  },
  "Fraud/Scam": {
    Instagram: ["victimAccountUrlFS", "fraudEvidenceFS", "fraudsterIdentifierFS"],
    Messenger: ["victimAccountUrlFS", "fraudEvidenceFS", "fraudsterIdentifierFS"],
    Facebook: ["victimAccountUrlFS", "fraudEvidenceFS", "fraudsterIdentifierFS"],
    WhatsApp: ["victimPhoneNumberWAFS", "fraudEvidenceWAFS", "fraudsterIdentifierWAFS"],
  },
}

export const DYNAMIC_FIELD_LABELS: Record<string, string> = {
  accountUrl: "URL of the account (not the alias)",
  usedTelcoAuth: "Used Telco to authenticate?",
  emailUsedToCreate: "Email address used to create the account",
  newEmailUsedOnMeta: "Brand new email address used on any of the Meta platforms",
  victimPhoneNumberWAHack: "WhatsApp (phone number) of the victim",
  usedTelcoAuthWAHack: "Used Telco to authenticate?",
  emailUsedToCreateWAHack: "Email used to create the account",
  newEmailToRecoverWAHack: "Brand new email to recover the account",
  realAccountUrl: "URL of the genuine account (not the alias)",
  fakeAccountUrls: "URL of the fake account(s) (comma-separated if multiple)",
  proofOfRealAccount: "Evidence of the veracity of the real account (e.g., website, article, ID URL)",
  usedTelcoAuthWAImpersonation: "Used Telco to authenticate?",
  victimAccountUrlFS: "URL of the victim's account (not the alias)",
  fraudEvidenceFS: "Evidence of fraud (screenshot URL; evidence of impact URL)",
  fraudsterIdentifierFS: "If possible, URL or number of fraudster",
  victimPhoneNumberWAFS: "WhatsApp (phone number) of the victim",
  fraudEvidenceWAFS: "Evidence of fraud (screenshot URL; evidence of impact URL)",
  fraudsterIdentifierWAFS: "If possible, URL or number of fraudster",
}

export const initialIncidentFormData: IncidentFormData = {
  firstName: "",
  lastName: "",
  emailAddress: "",
  primaryHarmType: "",
  affectedPlatforms: [],
  platformForDynamicQuestions: "",
  country: "",
  city: "",
  violationCode: "",
  incidentClassification: "",
  typeOfSupportProvided: "",
  culturalContext: "",
  violationReason: "",
  evidenceFiles: [],
  hackedElsewhere: "",
  hackedElsewhereDetails: "",
  crossPlatformDetails: "",
}
