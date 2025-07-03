"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowRight, User, FileText, MapPin, Plus, Trash2, Shield } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  HARM_TYPES,
  PLATFORMS_DYNAMIC,
  ALL_PLATFORMS_SELECT,
  INCIDENT_CLASSIFICATIONS,
  FIELD_REQUIREMENTS,
  DYNAMIC_FIELD_LABELS,
  initialIncidentFormData,
} from "@/lib/constants"
import type {
  IncidentFormData,
  HarmType,
  PlatformDynamic,
  PlatformSelect,
  IncidentClassification,
  PlatformProfile,
} from "@/types"

interface AddRequestPageProps {
  onSubmitAccountInfo: (data: IncidentFormData) => void
  onDeferToPlatform: () => void
  initialData?: Partial<IncidentFormData>
}

export default function AddRequestPage({ onSubmitAccountInfo, onDeferToPlatform, initialData }: AddRequestPageProps) {
  const [formData, setFormData] = useState<IncidentFormData>({
    ...initialIncidentFormData,
    ...initialData,
  })
  const [dynamicQuestionKeys, setDynamicQuestionKeys] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // -----------------------------------------
  // Dynamic-question keys & extra fields
  // -----------------------------------------
  useEffect(() => {
    // run ONLY when these 2 values change
    const { primaryHarmType, platformForDynamicQuestions } = formData

    const nextKeys =
      primaryHarmType && platformForDynamicQuestions
        ? (FIELD_REQUIREMENTS[primaryHarmType]?.[platformForDynamicQuestions] ?? [])
        : []

    // update keys if they actually changed
    setDynamicQuestionKeys((prev) => (JSON.stringify(prev) === JSON.stringify(nextKeys) ? prev : nextKeys))

    // add / prune dynamic fields **once**, not every render
    setFormData((prev) => {
      const draft = { ...prev }
      let changed = false

      // remove fields that are no longer required
      Object.keys(DYNAMIC_FIELD_LABELS).forEach((k) => {
        if (!nextKeys.includes(k) && k in draft) {
          delete draft[k]
          changed = true
        }
      })

      // add missing required fields
      nextKeys.forEach((k) => {
        if (!(k in draft)) {
          draft[k] = ""
          changed = true
        }
      })

      return changed ? draft : prev
    })
  }, [formData.primaryHarmType, formData.platformForDynamicQuestions]) // Added formData.platformForDynamicQuestions to dependencies

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof IncidentFormData | string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIncidentClassificationChange = (value: IncidentClassification | "") => {
    setFormData((prev) => ({ ...prev, incidentClassification: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, evidenceFiles: Array.from(e.target.files!) }))
    }
  }

  // Platform management functions
  const addPlatform = () => {
    setFormData((prev) => ({
      ...prev,
      affectedPlatforms: [
        ...prev.affectedPlatforms,
        { platform: "" as PlatformSelect, profileUrls: [""], userCount: 1 },
      ],
    }))
  }

  const removePlatform = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      affectedPlatforms: prev.affectedPlatforms.filter((_, i) => i !== index),
    }))
  }

  const updatePlatform = (index: number, field: keyof PlatformProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      affectedPlatforms: prev.affectedPlatforms.map((platform, i) =>
        i === index ? { ...platform, [field]: value } : platform,
      ),
    }))
  }

  const addProfileUrl = (platformIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      affectedPlatforms: prev.affectedPlatforms.map((platform, i) =>
        i === platformIndex ? { ...platform, profileUrls: [...platform.profileUrls, ""] } : platform,
      ),
    }))
  }

  const removeProfileUrl = (platformIndex: number, urlIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      affectedPlatforms: prev.affectedPlatforms.map((platform, i) =>
        i === platformIndex
          ? { ...platform, profileUrls: platform.profileUrls.filter((_, j) => j !== urlIndex) }
          : platform,
      ),
    }))
  }

  const updateProfileUrl = (platformIndex: number, urlIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      affectedPlatforms: prev.affectedPlatforms.map((platform, i) =>
        i === platformIndex
          ? {
              ...platform,
              profileUrls: platform.profileUrls.map((url, j) => (j === urlIndex ? value : url)),
            }
          : platform,
      ),
    }))
  }

  const handleHackedElsewhereChange = (value: "yes" | "no" | "dont_know") => {
    setFormData((prev) => ({ ...prev, hackedElsewhere: value }))

    if (value === "no") {
      // Defer to platform channel
      onDeferToPlatform()
      return
    }
  }

  const validateForm = (): boolean => {
    const requiredFields: (keyof IncidentFormData)[] = [
      "firstName",
      "lastName",
      "emailAddress",
      "primaryHarmType",
      "country",
      "violationReason",
    ]

    for (const field of requiredFields) {
      if (!formData[field]) {
        let label = (field as string).replace(/([A-Z])/g, " $1").trim()
        label = label.charAt(0).toUpperCase() + label.slice(1)
        if (field === "primaryHarmType") label = "Primary Harm Type"
        if (field === "violationReason") label = "Why is this a violation?"
        setError(`Please fill in the required field: ${label}.`)
        return false
      }
    }

    // Validate affected platforms
    if (formData.affectedPlatforms.length === 0) {
      setError("Please add at least one affected platform.")
      return false
    }

    for (const platform of formData.affectedPlatforms) {
      if (!platform.platform) {
        setError("Please select a platform for all affected platforms.")
        return false
      }
      if (platform.profileUrls.some((url) => !url.trim())) {
        setError("Please fill in all profile URLs.")
        return false
      }
      if (platform.userCount < 1) {
        setError("User count must be at least 1.")
        return false
      }
    }

    // Validate hacking-specific questions
    if (formData.primaryHarmType === "Hacked Account Take over") {
      if (!formData.hackedElsewhere) {
        setError("Please answer if you've been hacked elsewhere.")
        return false
      }
      if (formData.hackedElsewhere === "yes" && !formData.hackedElsewhereDetails?.trim()) {
        setError("Please provide details about being hacked elsewhere.")
        return false
      }
    }

    // Validate dynamic questions
    for (const key of dynamicQuestionKeys) {
      if (!formData[key] && formData[key] !== false) {
        setError(`Please fill in: ${DYNAMIC_FIELD_LABELS[key] || key}.`)
        return false
      }
    }

    setError(null)
    return true
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    onSubmitAccountInfo(formData)
  }

  // Initialize with one platform if empty
  useEffect(() => {
    if (formData.affectedPlatforms.length === 0) {
      addPlatform()
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            Account & Incident Information
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Please provide all necessary details. You can add multiple platforms and profiles affected.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Submitter Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Submitter Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Incident Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Incident Details</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryHarmType" className="text-sm font-medium text-gray-700">
                  Primary Harm Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="primaryHarmType"
                  value={formData.primaryHarmType}
                  onValueChange={(value) => handleSelectChange("primaryHarmType", value as HarmType)}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <SelectValue placeholder="Select harm type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                    {HARM_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-blue-50">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hacking-specific questions */}
              {formData.primaryHarmType === "Hacked Account Take over" && (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-orange-900">Hacking Assessment</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Do you know if you've been hacked elsewhere? <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.hackedElsewhere || ""}
                        onValueChange={handleHackedElsewhereChange}
                        required
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="yes" className="hover:bg-blue-50">
                            Yes, I've been hacked on other platforms
                          </SelectItem>
                          <SelectItem value="no" className="hover:bg-blue-50">
                            No, this is the only platform
                          </SelectItem>
                          <SelectItem value="dont_know" className="hover:bg-blue-50">
                            I don't know
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.hackedElsewhere === "yes" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hackedElsewhereDetails" className="text-sm font-medium text-gray-700">
                            Which other platforms have been affected? <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="hackedElsewhereDetails"
                            name="hackedElsewhereDetails"
                            value={formData.hackedElsewhereDetails || ""}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Please list the other platforms and any relevant details..."
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="crossPlatformDetails" className="text-sm font-medium text-gray-700">
                            Cross-platform details (Optional)
                          </Label>
                          <Textarea
                            id="crossPlatformDetails"
                            name="crossPlatformDetails"
                            value={formData.crossPlatformDetails || ""}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any additional information about how the attacks are connected..."
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Affected Platforms Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Affected Platforms & Profiles</h3>
                </div>
                <Button
                  type="button"
                  onClick={addPlatform}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Platform
                </Button>
              </div>

              {formData.affectedPlatforms.map((platform, platformIndex) => (
                <div key={platformIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Platform {platformIndex + 1}</h4>
                    {formData.affectedPlatforms.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePlatform(platformIndex)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Platform <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={platform.platform}
                        onValueChange={(value) => updatePlatform(platformIndex, "platform", value as PlatformSelect)}
                        required
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                          {ALL_PLATFORMS_SELECT.map((p) => (
                            <SelectItem key={p} value={p} className="hover:bg-blue-50">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Number of Users Affected <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={platform.userCount}
                        onChange={(e) =>
                          updatePlatform(platformIndex, "userCount", Number.parseInt(e.target.value) || 1)
                        }
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-700">
                        Profile URLs <span className="text-red-500">*</span>
                      </Label>
                      <Button
                        type="button"
                        onClick={() => addProfileUrl(platformIndex)}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add URL
                      </Button>
                    </div>

                    {platform.profileUrls.map((url, urlIndex) => (
                      <div key={urlIndex} className="flex gap-2">
                        <Input
                          value={url}
                          onChange={(e) => updateProfileUrl(platformIndex, urlIndex, e.target.value)}
                          placeholder={`Profile URL ${urlIndex + 1} (e.g., instagram.com/username)`}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        {platform.profileUrls.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeProfileUrl(platformIndex, urlIndex)}
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Platform for Dynamic Questions */}
            {formData.primaryHarmType && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="platformForDynamicQuestions" className="text-sm font-medium text-gray-700">
                    Primary Platform for Specific Questions <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    name="platformForDynamicQuestions"
                    value={formData.platformForDynamicQuestions}
                    onValueChange={(value) =>
                      handleSelectChange("platformForDynamicQuestions", value as PlatformDynamic)
                    }
                    required
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                      <SelectValue placeholder="Select primary platform for detailed questions" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                      {PLATFORMS_DYNAMIC.map((p) => (
                        <SelectItem key={p} value={p} className="hover:bg-blue-50">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Select the main platform for detailed technical questions about this incident.
                  </p>
                </div>
              </section>
            )}

            {/* Dynamic Questions Section */}
            {dynamicQuestionKeys.length > 0 && (
              <section className="space-y-6 bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900">
                  Specific Questions for {formData.primaryHarmType} on {formData.platformForDynamicQuestions}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dynamicQuestionKeys.map((key) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                        {DYNAMIC_FIELD_LABELS[key] || key} <span className="text-red-500">*</span>
                      </Label>
                      {key.toLowerCase().includes("telco") || key.toLowerCase().includes("authenticate") ? (
                        <Select
                          name={key}
                          value={formData[key] || ""}
                          onValueChange={(value) => handleSelectChange(key, value)}
                          required
                        >
                          <SelectTrigger
                            id={key}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                          >
                            <SelectValue placeholder="Select Yes or No" />
                          </SelectTrigger>
                          <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="Yes" className="hover:bg-blue-50">
                              Yes
                            </SelectItem>
                            <SelectItem value="No" className="hover:bg-blue-50">
                              No
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={key}
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleChange}
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Additional Case Information Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Additional Case Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City (Optional)
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="violationCode" className="text-sm font-medium text-gray-700">
                  Violation Code (Optional)
                </Label>
                <Input
                  id="violationCode"
                  name="violationCode"
                  value={formData.violationCode}
                  onChange={handleChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="typeOfSupportProvided" className="text-sm font-medium text-gray-700">
                    Type of support provided (Optional)
                  </Label>
                  <Textarea
                    id="typeOfSupportProvided"
                    name="typeOfSupportProvided"
                    value={formData.typeOfSupportProvided}
                    onChange={handleChange}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="culturalContext" className="text-sm font-medium text-gray-700">
                    Cultural context of the request? (Optional)
                  </Label>
                  <Textarea
                    id="culturalContext"
                    name="culturalContext"
                    value={formData.culturalContext}
                    onChange={handleChange}
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="violationReason" className="text-sm font-medium text-gray-700">
                  Why is this a violation? / Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="violationReason"
                  name="violationReason"
                  value={formData.violationReason}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceFiles" className="text-sm font-medium text-gray-700">
                  Evidence (Optional, max 5 files)
                </Label>
                <Input
                  id="evidenceFiles"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.evidenceFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                    <ul className="space-y-1">
                      {formData.evidenceFiles.map((file) => (
                        <li key={file.name} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <Button
                type="submit"
                size="lg"
                className="min-w-[250px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Proceed to Identity Verification <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
