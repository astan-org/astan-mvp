"use client";

import { useAuth } from "react-oidc-context";

export default function AuthButtons() {
  const auth = useAuth();

  if (auth.isLoading) return <p>Loading...</p>;

  return (
    <div>
      {auth.isAuthenticated ? (
        <>
          <p>Welcome {auth.user?.profile.email}</p>
          <button onClick={() => auth.signoutRedirect()}>Logout</button>
        </>
      ) : (
        <button onClick={() => auth.signinRedirect()}>Login / Signup</button>
      )}
    </div>
  );
}