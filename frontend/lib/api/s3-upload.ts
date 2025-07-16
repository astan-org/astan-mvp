// lib/api/s3-upload.ts
export async function uploadEvidenceFile(file: File): Promise<{ fileKey: string }> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://8zo99udgc3.execute-api.us-east-1.amazonaws.com/Prod";

  // 1. Ask your Lambda for a pre-signed URL
  const presignRes = await fetch(`${apiBaseUrl}/generate-upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });

  if (!presignRes.ok) {
    throw new Error("Failed to obtain pre-signed upload URL");
  }

  // backend returns { url, key }
  const { url, key } = await presignRes.json();

  // 2. PUT the file directly to S3
  const uploadRes = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Upload to S3 failed");
  }

  // Give the caller the object key so they can store it in DynamoDB / send to API
  return { fileKey: key };
}
