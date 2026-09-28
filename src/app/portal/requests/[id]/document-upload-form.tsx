"use client";

import { upload } from "@vercel/blob/client";
import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

type FinalizeDocumentResponse = {
  success?: boolean;
  documentId?: string;
  error?: string;
};

export function DocumentUploadForm({
  requestId,
}: DocumentUploadFormProps) {
  const router = useRouter();

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
      /*
       * Calculate the document hash before upload.
       * The backend uses this for duplicate protection.
       */
      const sha256Hash =
        await calculateFileSha256(file);

      /*
       * The pathname contains no tenant identifiers supplied
       * by the browser. The authenticated server validates
       * ownership of the request before issuing an upload token.
       */
      const pathname = [
        "taxready",
        "client-uploads",
        requestId,
        `${crypto.randomUUID()}-${sanitizeDocumentFileName(
          file.name,
        )}`,
      ].join("/");

      /*
       * Step 1:
       * Upload the PDF to private Vercel Blob storage.
       */
      const uploadedBlob = await upload(
        pathname,
        file,
        {
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
        },
      );

      /*
       * Step 2:
       * Explicitly finalize the upload in TaxReady.
       *
       * We do not consider the workflow successful merely
       * because Blob storage accepted the file. The backend
       * must create the Document and update the request and
       * requirement workflow states first.
       */
      const finalizeResponse = await fetch(
        "/api/client-portal/documents/finalize",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            requestId,
            fileName: file.name,
            storageKey: uploadedBlob.pathname,
            mimeType:
              uploadedBlob.contentType ||
              "application/pdf",
            sizeBytes: file.size,
            sha256Hash,
          }),
        },
      );

      const finalizeResult =
        (await finalizeResponse.json()) as FinalizeDocumentResponse;

      if (!finalizeResponse.ok) {
        throw new Error(
          finalizeResult.error ||
            "DOCUMENT_FINALIZATION_FAILED",
        );
      }

      /*
       * Only show success after TaxReady has confirmed that
       * the database workflow was finalized successfully.
       */
      setSuccess(true);
      setFile(null);

      /*
       * The request is now SUBMITTED, so return to the
       * request list. Opening it again should show the
       * read-only submitted state instead of the upload form.
       */
      router.replace("/portal/requests");
      router.refresh();
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
      } else if (
        message.includes("REQUEST_NOT_UPLOADABLE") ||
        message.includes("REQUEST_NOT_FINALIZABLE")
      ) {
        setError(
          "This request can no longer accept document uploads. Please refresh the page.",
        );
      } else if (
        message.includes("INVALID_DOCUMENT_SIZE")
      ) {
        setError(
          "The document size is invalid. PDF must be 10 MB or smaller.",
        );
      } else if (
        message.includes("UNAUTHORIZED")
      ) {
        setError(
          "Your session has expired. Please sign in again.",
        );
      } else {
        setError(
          "Document upload could not be completed. Please try again.",
        );
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