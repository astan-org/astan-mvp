export function parseHash(): Record<string, string> {
  const hash = window.location.hash.substring(1)
  return hash.split("&").reduce((acc, part) => {
    const [key, value] = part.split("=")
    if (key && value) acc[key] = decodeURIComponent(value)
    return acc
  }, {} as Record<string, string>)
}
