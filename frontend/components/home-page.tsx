"use client"
import { ShieldAlert, ArrowRight } from "lucide-react"

interface HomePageProps {
  onStartReport: () => void
}

export default function HomePage({ onStartReport }: HomePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto bg-blue-50 p-4 rounded-full w-fit mb-6">
            <ShieldAlert className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Report a Social Media Incident</h1>
          <p className="text-lg text-gray-600 mb-6">
            If your account has been hacked, impersonated, or you've been a victim of a scam, we're here to help.
          </p>
          <p className="text-gray-600 mb-8">
            Our streamlined process will guide you through providing the necessary information and verifying your
            identity to expedite your case.
          </p>
          <div className="space-y-4">
            <button
              onClick={onStartReport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Start a Report <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => alert("Get Help Now - To be implemented")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors border border-gray-300"
            >
              Get Help Now (FAQ / Support)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
