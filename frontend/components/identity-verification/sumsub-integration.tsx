"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, ShieldX, UserCheck } from "lucide-react"
import { useEffect } from "react"

interface SumSubIntegrationProps {
  onVerificationComplete: (success: boolean, verificationData?: any) => void
}

export default function SumSubIntegration({ onVerificationComplete }: SumSubIntegrationProps) {
  useEffect(() => {
    console.log("SumSubIntegration: SDK would initialize here.")
    return () => {
      console.log("SumSubIntegration: SDK would be destroyed here if necessary.")
    }
  }, [onVerificationComplete])

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
          <UserCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Identity Verification</CardTitle>
        <CardDescription>
          To proceed with your report, please complete the identity verification process. This helps us ensure the
          security and integrity of all reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          id="sumsub-websdk-container"
          className="min-h-[300px] border rounded-md flex items-center justify-center bg-muted/50"
        >
          <p className="text-muted-foreground p-4">
            (SumSub WebSDK would be embedded here. For now, use buttons below to simulate.)
          </p>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          You will be guided to provide a photo of your ID and a selfie.
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t">
          <p className="text-sm text-center font-medium">For Demo Purposes Only:</p>
          <Button
            onClick={() => onVerificationComplete(true, { verificationId: "sim_verified_123" })}
            variant="default"
          >
            <ShieldCheck className="mr-2 h-4 w-4" /> Simulate Verification Success
          </Button>
          <Button
            onClick={() => onVerificationComplete(false, { reason: "sim_manual_rejection" })}
            variant="destructive"
          >
            <ShieldX className="mr-2 h-4 w-4" /> Simulate Verification Failed
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
