"use client";

import { ReactNode } from "react";
import { AuthProvider } from "react-oidc-context";
import { cognitoAuthConfig } from "@/lib/cognitoAuthConfig";

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
}
