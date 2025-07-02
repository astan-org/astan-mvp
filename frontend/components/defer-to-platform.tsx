"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, ArrowLeft } from "lucide-react"

interface DeferToPlatformProps {
  onGoBack: () => void
}

export default function DeferToPlatform({ onGoBack }: DeferToPlatformProps) {
  const platformChannels = [
    { name: "Instagram", url: "https://help.instagram.com/149494825257596" },
    { name: "Facebook", url: "https://www.facebook.com/help/203305893040179/" },
    { name: "WhatsApp", url: "https://faq.whatsapp.com/1131652977717250" },
    { name: "Messenger", url: "https://www.facebook.com/help/messenger-app/1216349518398524/" },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200">
        <CardHeader className="text-center bg-blue-50 border-b border-blue-200">
          <CardTitle className="text-2xl font-bold text-gray-900">Platform-Specific Support Recommended</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Based on your responses, we recommend contacting the platform directly for faster resolution.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">
                Since this appears to be an isolated incident on a single platform, the platform's own support channels
                may be able to resolve your issue more quickly.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Support Channels:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platformChannels.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{platform.name}</span>
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>Still need our help?</strong> If the platform doesn't resolve your issue or you believe this is
                part of a larger coordinated attack, you can return and continue with our process.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 border-t border-gray-200">
          <Button onClick={onGoBack} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back to Form
          </Button>
          <Button onClick={() => (window.location.href = "/")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
