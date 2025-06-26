"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Home } from "lucide-react"

interface ConfirmationPageProps {
  caseId: string | null
  onGoHome: () => void
}

export default function ConfirmationPage({ caseId, onGoHome }: ConfirmationPageProps) {
  return (
    <Card className="w-full max-w-lg text-center shadow-xl">
      <CardHeader>
        <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit mb-4">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-3xl font-bold">Report Submitted Successfully!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground pt-2">
          Thank you for submitting your incident report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {caseId ? (
          <p className="text-lg">
            Your Case ID is: <strong className="text-primary">{caseId}</strong>
          </p>
        ) : (
          <p className="text-lg text-destructive">Could not retrieve Case ID. Please contact support.</p>
        )}
        <p>
          We will review your submission and get back to you as soon as possible. You may receive email updates
          regarding your case.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" onClick={onGoHome}>
          <Home className="mr-2 h-5 w-5" /> Go to Homepage
        </Button>
      </CardFooter>
    </Card>
  )
}
