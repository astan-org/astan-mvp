// Primary Harm Types for Dynamic Questions
export const HARM_TYPES_VALUES = ["Hacked Account Take over", "Impersonation", "Fraud/Scam"] as const
export type HarmType = (typeof HARM_TYPES_VALUES)[number]

// Platforms for Dynamic Questions
export const PLATFORMS_DYNAMIC_VALUES = ["Instagram", "Facebook", "Messenger", "WhatsApp"] as const
export type PlatformDynamic = (typeof PLATFORMS_DYNAMIC_VALUES)[number]

// All Platforms for General Selection Dropdown
export const ALL_PLATFORMS_SELECT_VALUES = [
  "Instagram",
  "Facebook",
  "Messenger",
  "WhatsApp"
] as const
export type PlatformSelect = (typeof ALL_PLATFORMS_SELECT_VALUES)[number]

// Secondary Incident Classification
export const INCIDENT_CLASSIFICATIONS_VALUES = [
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
export type IncidentClassification = (typeof INCIDENT_CLASSIFICATIONS_VALUES)[number]

// New interface for platform-specific profiles
export interface PlatformProfile {
  platform: PlatformSelect
  profileUrls: string[]
  userCount: number
}

export interface IncidentFormData {
  firstName: string
  lastName: string
  emailAddress: string
  primaryHarmType: HarmType | ""
  affectedPlatforms: PlatformProfile[]
  platformForDynamicQuestions: PlatformDynamic | ""
  country: string
  city: string
  violationCode: string
  incidentClassification: IncidentClassification | ""
  typeOfSupportProvided: string
  culturalContext: string
  violationReason: string
  evidenceFiles: File[]
  // Hacking-specific fields
  hackedElsewhere?: "yes" | "no" | "dont_know" | ""
  hackedElsewhereDetails?: string
  crossPlatformDetails?: string
  [key: string]: any
}

export type AppStep =
  | "SHOWING_HOMEPAGE"
  | "FILLING_ACCOUNT_INFO"
  | "PENDING_ID_VERIFICATION"
  | "ID_VERIFICATION_IN_PROGRESS"
  | "ID_VERIFICATION_APPROVED"
  | "ID_VERIFICATION_FAILED"
  | "SUBMITTING_INCIDENT"
  | "SHOWING_CONFIRMATION"
  | "DEFER_TO_PLATFORM"
