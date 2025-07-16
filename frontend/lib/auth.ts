export function getAccessToken(): Promise<string | null> {
  const token = localStorage.getItem("accessToken")
  return Promise.resolve(token)
}