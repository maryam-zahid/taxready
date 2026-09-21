export const DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_ALLOWED_CONTENT_TYPES = [
  "application/pdf",
] as const;

export function sanitizeDocumentFileName(fileName: string) {
  const withoutPath = fileName
    .split(/[\\/]/)
    .pop()
    ?.trim();

  const safeName = (withoutPath || "document.pdf")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "");

  return safeName.toLowerCase().endsWith(".pdf")
    ? safeName
    : `${safeName}.pdf`;
}

export function buildClientDocumentPrefix(input: {
  organizationId: string;
  clientId: string;
  requestId: string;
}) {
  return [
    "taxready",
    input.organizationId,
    "clients",
    input.clientId,
    "requests",
    input.requestId,
  ].join("/");
}

export async function calculateFileSha256(file: File) {
  const bytes = await file.arrayBuffer();

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    bytes,
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}