import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlatformDynamic } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getPlatformFromUrl = (url: string): PlatformDynamic | null => {
  if (!url) return null
  try {
    const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.toLowerCase()
    if (hostname.includes("instagram.com")) return "Instagram"
    if (hostname.includes("facebook.com")) return "Facebook"
    if (hostname.includes("messenger.com") || hostname.includes("m.me")) return "Messenger"
    if (hostname.includes("whatsapp.com") || hostname.includes("wa.me")) return "WhatsApp"
  } catch (e) {
    /* ignore invalid URLs for detection */
  }
  return null
}
