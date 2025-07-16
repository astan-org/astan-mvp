import type { ReactNode } from "react"
import { Shield, LayoutDashboard, FileText, LogOut, BarChart3, PlusSquare, Zap, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface DashboardLayoutProps {
  children: ReactNode
  currentStep?: string
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#", id: "dashboard" },
  { name: "Reports", icon: FileText, href: "#", id: "reports" },
  { name: "Add Request", icon: PlusSquare, href: "/", id: "add_request" },
  { name: "Log Off", icon: LogOut, href: "#", id: "logoff" },
]

export default function DashboardLayout({ children, currentStep }: DashboardLayoutProps) {
  const isAddRequestActive =
    currentStep === "FILLING_ACCOUNT_INFO" ||
    currentStep === "PENDING_ID_VERIFICATION" ||
    currentStep === "ID_VERIFICATION_IN_PROGRESS" ||
    currentStep === "SUBMITTING_INCIDENT" ||
    currentStep === "SHOWING_CONFIRMATION"

  return (
    <div className="flex h-screen bg-muted/40">
      <aside className="w-64 flex-col border-r bg-white p-6 hidden md:flex">
        <Link href="/" className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Astan</h1>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={`justify-start text-sm h-10 ${
                (item.id === "add_request" && isAddRequestActive) || item.href === currentStep
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 sticky top-0 z-10">
          <div />
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 sm:w-[200px] md:w-[240px] lg:w-[300px] h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 border-gray-300">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>English (UK)</DropdownMenuItem>
                <DropdownMenuItem>English (US)</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
