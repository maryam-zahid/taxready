"use client";

import { upload } from "@vercel/blob/client";
import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculateFileSha256,
  DOCUMENT_MAX_SIZE_BYTES,
  sanitizeDocumentFileName,
} from "@/lib/document-storage";

type DocumentUploadFormProps = {
  requestId: string;
};

export function DocumentUploadForm({
  requestId,
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setError(null);
    setSuccess(false);

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" ||
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      event.target.value = "";
      setError("Please select a PDF document.");
      return;
    }

    if (selectedFile.size > DOCUMENT_MAX_SIZE_BYTES) {
      setFile(null);
      event.target.value = "";
      setError("PDF must be 10 MB or smaller.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      event.target.value = "";
      setError("The selected PDF is empty.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF document.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const sha256Hash = await calculateFileSha256(file);

      /*
       * This is only a temporary client pathname.
       * The server validates the authenticated request and will
       * constrain the final upload path in the next backend step.
       */
     const pathname = [
  "taxready",
  "client-uploads",
  requestId,
  `${crypto.randomUUID()}-${sanitizeDocumentFileName(file.name)}`,
].join("/");

      await upload(pathname, file, {
        access: "private",
        handleUploadUrl:
          "/api/client-portal/documents/upload",

        clientPayload: JSON.stringify({
          requestId,
          fileName: file.name,
          sizeBytes: file.size,
          sha256Hash,
        }),

        contentType: "application/pdf",
        multipart: false,
      });

      setSuccess(true);
      setFile(null);
    } catch (uploadError) {
      console.error(
        "Document upload failed:",
        uploadError,
      );

      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Document upload failed. Please try again.";

      if (message.includes("DUPLICATE_DOCUMENT")) {
        setError(
          "This document has already been uploaded.",
        );
      } else {
        setError(message);
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border bg-muted/40 p-2">
          <UploadCloud className="size-5" />
        </div>

        <div>
          <p className="font-medium">
            Upload PDF document
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            PDF only. Maximum file size 10 MB.
          </p>
        </div>
      </div>

      <Input
        type="file"
        accept="application/pdf,.pdf"
        disabled={isUploading}
        onChange={handleFileChange}
      />

      {file ? (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
          <FileText className="size-4 shrink-0" />

          <span className="min-w-0 flex-1 truncate">
            {file.name}
          </span>

          <span className="shrink-0 text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </span>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" />

          Document uploaded successfully.
        </div>
      ) : null}

      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={!file || isUploading}
        onClick={handleUpload}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <UploadCloud className="size-4" />
            Upload document
          </>
        )}
      </Button>
    </div>
  );
}