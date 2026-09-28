import {
  DocumentStatus,
  DocumentValidationStatus,
  ExceptionSeverity,
  ExceptionSource,
  ExceptionStatus,
  ValidationCheckStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

type RunDocumentValidationInput = {
  organizationId: string;
  documentId: string;
  userId?: string;
};

export async function runDocumentValidation(
  input: RunDocumentValidationInput,
) {
  const document = await prisma.document.findFirst({
    where: {
      id: input.documentId,
      organizationId: input.organizationId,
    },
    include: {
      client: {
        select: {
          id: true,
          taxYear: true,
        },
      },
      clientRequirement: {
        select: {
          id: true,
          taxYear: true,
          requirementDefinition: {
            select: {
              title: true,
              responseType: true,
            },
          },
        },
      },
      extraction: {
  select: {
    status: true,
    fields: {
      where: {
        key: "tax_year",
      },
      select: {
        textValue: true,
        numericValue: true,
      },
      take: 1,
    },
  },
},
    },
  });

  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  /*
 * Structural checks use facts TaxReady knows directly.
 * Content-based checks only use values produced by the
 * document extraction layer.
 */
  const fileTypeCheck =
    document.mimeType === "application/pdf"
      ? ValidationCheckStatus.PASSED
      : ValidationCheckStatus.FAILED;

  const fileSizeCheck =
    document.sizeBytes > 0 &&
    document.sizeBytes <= MAX_DOCUMENT_SIZE_BYTES
      ? ValidationCheckStatus.PASSED
      : ValidationCheckStatus.FAILED;

  const requirementCheck =
    document.clientRequirementId &&
    document.clientRequirement
      ? ValidationCheckStatus.PASSED
      : ValidationCheckStatus.FAILED;

  const expectedTaxYear =
    document.clientRequirement?.taxYear ??
    document.client.taxYear;

  const extractedTaxYearField =
  document.extraction?.fields[0];

const extractedTaxYear =
  extractedTaxYearField?.numericValue !== null &&
  extractedTaxYearField?.numericValue !== undefined
    ? Number(extractedTaxYearField.numericValue)
    : Number(extractedTaxYearField?.textValue);

const detectedTaxYear =
  Number.isInteger(extractedTaxYear) &&
  extractedTaxYear >= 2000 &&
  extractedTaxYear <= 2100
    ? extractedTaxYear
    : null;

  const taxYearCheck =
    detectedTaxYear === null
      ? ValidationCheckStatus.NOT_CHECKED
      : detectedTaxYear === expectedTaxYear
        ? ValidationCheckStatus.PASSED
        : ValidationCheckStatus.FAILED;

  const hasFailure = [
    fileTypeCheck,
    fileSizeCheck,
    requirementCheck,
    taxYearCheck,
  ].some(
    (status) => status === ValidationCheckStatus.FAILED,
  );

  const validationStatus = hasFailure
    ? DocumentValidationStatus.NEEDS_REVIEW
    : DocumentValidationStatus.PASSED;

  const summary = hasFailure
    ? "One or more deterministic validation checks failed and require practitioner review."
    : taxYearCheck === ValidationCheckStatus.NOT_CHECKED
      ? "Basic validation passed. Tax year content verification is pending document extraction."
      : "All available validation checks passed.";

  const result = await prisma.$transaction(async (tx) => {
    const validation = await tx.documentValidation.upsert({
      where: {
        documentId: document.id,
      },
      create: {
        documentId: document.id,
        status: validationStatus,
        fileTypeCheck,
        fileSizeCheck,
        requirementCheck,
        taxYearCheck,
        expectedTaxYear,
        detectedTaxYear,
        summary,
        validatedAt: new Date(),
      },
      update: {
        status: validationStatus,
        fileTypeCheck,
        fileSizeCheck,
        requirementCheck,
        taxYearCheck,
        expectedTaxYear,
        detectedTaxYear,
        summary,
        validatedAt: new Date(),
      },
    });

    if (hasFailure) {
      await tx.document.update({
        where: {
          id: document.id,
        },
        data: {
          status: DocumentStatus.NEEDS_REVIEW,
        },
      });

      if (document.clientRequirementId) {
        await tx.clientRequirement.update({
          where: {
            id: document.clientRequirementId,
          },
          data: {
            status: "NEEDS_REVIEW",
          },
        });
      }

      const existingException =
        await tx.complianceException.findFirst({
          where: {
            organizationId: document.organizationId,
            clientId: document.clientId,
            documentId: document.id,
            source: ExceptionSource.VALIDATION,
            status: {
              in: [
                ExceptionStatus.OPEN,
                ExceptionStatus.WAITING_CLIENT,
                ExceptionStatus.UNDER_REVIEW,
              ],
            },
          },
          select: {
            id: true,
          },
        });

      const description =
        "Automated document validation found one or more checks that require practitioner review.";

      if (existingException) {
        await tx.complianceException.update({
          where: {
            id: existingException.id,
          },
          data: {
            title: "Document validation requires review",
            description,
            severity: ExceptionSeverity.BLOCKING,
          },
        });
      } else {
        await tx.complianceException.create({
          data: {
            organizationId: document.organizationId,
            clientId: document.clientId,
            clientRequirementId:
              document.clientRequirementId,
            documentId: document.id,
            title: "Document validation requires review",
            description,
            status: ExceptionStatus.OPEN,
            severity: ExceptionSeverity.BLOCKING,
            source: ExceptionSource.VALIDATION,
            createdByUserId: input.userId ?? null,
          },
        });
      }
    }
if (!hasFailure) {
  await tx.complianceException.updateMany({
    where: {
      organizationId: document.organizationId,
      clientId: document.clientId,
      documentId: document.id,
      source: ExceptionSource.VALIDATION,
      status: {
        in: [
          ExceptionStatus.OPEN,
          ExceptionStatus.WAITING_CLIENT,
          ExceptionStatus.UNDER_REVIEW,
        ],
      },
    },
    data: {
      status: ExceptionStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedByUserId: input.userId ?? null,
    },
  });
}
    return validation;
  });

  return result;
}