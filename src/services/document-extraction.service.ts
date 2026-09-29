import { get } from "@vercel/blob";
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import {
  DocumentExtractionStatus,
  ExtractedFieldType,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type RunDocumentExtractionInput = {
  organizationId: string;
  documentId: string;
};

type ParsedField = {
  key: string;
  label: string;
  type: ExtractedFieldType;
  textValue?: string;
  numericValue?: number;
  sourceText?: string;
};

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hasMeaningfulExtractedText(
  text: string,
) {
  const withoutPageMarkers = text
    .replace(
      /--\s*\d+\s+of\s+\d+\s*--/gi,
      "",
    )
    .trim();

  return withoutPageMarkers.length >= 20;
}

function parseMoney(value: string) {
  const normalized = value
    .replace(/PKR/gi, "")
    .replace(/Rs\.?/gi, "")
    .replace(/,/g, "")
    .trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

function addTextField(
  fields: ParsedField[],
  input: {
    key: string;
    label: string;
    value?: string | null;
    sourceText?: string;
  },
) {
  const value = input.value?.trim();

  if (!value) {
    return;
  }

  fields.push({
    key: input.key,
    label: input.label,
    type: ExtractedFieldType.TEXT,
    textValue: value,
    sourceText: input.sourceText,
  });
}

function addMoneyField(
  fields: ParsedField[],
  input: {
    key: string;
    label: string;
    value?: string | null;
    sourceText?: string;
  },
) {
  if (!input.value) {
    return;
  }

  const numericValue = parseMoney(input.value);

  if (numericValue === null) {
    return;
  }

  fields.push({
    key: input.key,
    label: input.label,
    type: ExtractedFieldType.MONEY,
    textValue: input.value.trim(),
    numericValue,
    sourceText: input.sourceText,
  });
}

function extractFirstMatch(
  text: string,
  patterns: RegExp[],
) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return {
        value: match[1].trim(),
        sourceText: match[0].trim(),
      };
    }
  }

  return null;
}

function extractFields(text: string): ParsedField[] {
  const fields: ParsedField[] = [];

  const taxYear = extractFirstMatch(text, [
    /Tax\s*Year\s*[:\-]?\s*(20\d{2})/i,
    /Tax\s*Period\s*[:\-]?\s*(20\d{2})/i,
  ]);

  if (taxYear) {
    fields.push({
      key: "tax_year",
      label: "Tax Year",
      type: ExtractedFieldType.TAX_YEAR,
      textValue: taxYear.value,
      numericValue: Number(taxYear.value),
      sourceText: taxYear.sourceText,
    });
  }

  const employeeName = extractFirstMatch(text, [
    /Employee\s*Name\s*[:\-]?\s*([^\n]+)/i,
    /Name\s*of\s*Employee\s*[:\-]?\s*([^\n]+)/i,
  ]);

  addTextField(fields, {
    key: "employee_name",
    label: "Employee Name",
    value: employeeName?.value,
    sourceText: employeeName?.sourceText,
  });

  /*
   * CNIC is document evidence only.
   * It does not update the Client/Profile automatically.
   */
  const cnic = extractFirstMatch(text, [
    /CNIC\s*[:\-]?\s*([0-9]{5}-?[0-9]{7}-?[0-9])/i,
  ]);

  addTextField(fields, {
    key: "cnic",
    label: "CNIC",
    value: cnic?.value,
    sourceText: cnic?.sourceText,
  });

  const employer = extractFirstMatch(text, [
    /Employer(?:\s*Name)?\s*[:\-]?\s*([^\n]+)/i,
    /Company(?:\s*Name)?\s*[:\-]?\s*([^\n]+)/i,
  ]);

  addTextField(fields, {
    key: "employer_name",
    label: "Employer",
    value: employer?.value,
    sourceText: employer?.sourceText,
  });

  const grossSalary = extractFirstMatch(text, [
    /Gross\s*Salary\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "gross_salary",
    label: "Gross Salary",
    value: grossSalary?.value,
    sourceText: grossSalary?.sourceText,
  });

  const taxDeducted = extractFirstMatch(text, [
    /Tax\s*Deducted\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "tax_deducted",
    label: "Tax Deducted",
    value: taxDeducted?.value,
    sourceText: taxDeducted?.sourceText,
  });

  const profitReturn = extractFirstMatch(text, [
    /Profit\s*\/?\s*Return\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "profit_return",
    label: "Profit / Return",
    value: profitReturn?.value,
    sourceText: profitReturn?.sourceText,
  });

  const taxWithheld = extractFirstMatch(text, [
    /Tax\s*Withheld\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "tax_withheld",
    label: "Tax Withheld",
    value: taxWithheld?.value,
    sourceText: taxWithheld?.sourceText,
  });

  const grossRent = extractFirstMatch(text, [
    /Gross\s*Rent\s*Received\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "gross_rent_received",
    label: "Gross Rent Received",
    value: grossRent?.value,
    sourceText: grossRent?.sourceText,
  });

  const documentedExpenses = extractFirstMatch(text, [
    /Documented\s*Expenses\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "documented_expenses",
    label: "Documented Expenses",
    value: documentedExpenses?.value,
    sourceText: documentedExpenses?.sourceText,
  });

  const netAmount = extractFirstMatch(text, [
    /Net\s*Amount\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

    addMoneyField(fields, {
            key: "net_amount",
    label: "Net Amount",
    value: netAmount?.value,
    sourceText: netAmount?.sourceText,
  });

  // Business bank statement fields
  const accountTitle = extractFirstMatch(text, [
    /Account\s*title\s*[:\-]?\s*([^\n]+)/i,
  ]);

  addTextField(fields, {
    key: "account_title",
    label: "Account Title",
    value: accountTitle?.value,
    sourceText: accountTitle?.sourceText,
  });

  const accountNumber = extractFirstMatch(text, [
    /Account\s*number\s*[:\-]?\s*([^\n]+)/i,
  ]);

  addTextField(fields, {
    key: "account_number",
    label: "Account Number",
    value: accountNumber?.value,
    sourceText: accountNumber?.sourceText,
  });

  const iban = extractFirstMatch(text, [
    /IBAN\s*[:\-]?\s*([^\n]+)/i,
  ]);

  addTextField(fields, {
    key: "iban",
    label: "IBAN",
    value: iban?.value,
    sourceText: iban?.sourceText,
  });

  const statementPeriod = extractFirstMatch(text, [
    /Statement\s*period\s*[:\-]?\s*([^\n]+)/i,
  ]);

  addTextField(fields, {
    key: "statement_period",
    label: "Statement Period",
    value: statementPeriod?.value,
    sourceText: statementPeriod?.sourceText,
  });

  const openingBalance = extractFirstMatch(text, [
    /Opening\s*balance\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "opening_balance",
    label: "Opening Balance",
    value: openingBalance?.value,
    sourceText: openingBalance?.sourceText,
  });

  const closingBalance = extractFirstMatch(text, [
    /Closing\s*balance\s*[:\-]?\s*(?:PKR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ]);

  addMoneyField(fields, {
    key: "closing_balance",
    label: "Closing Balance",
    value: closingBalance?.value,
    sourceText: closingBalance?.sourceText,
  });

  return fields;
}

export async function runDocumentExtraction(
  input: RunDocumentExtractionInput,
) {
  const document = await prisma.document.findFirst({
    where: {
      id: input.documentId,
      organizationId: input.organizationId,
    },
    select: {
      id: true,
      storageKey: true,
      mimeType: true,
    },
  });

  if (!document) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  if (document.mimeType !== "application/pdf") {
    throw new Error("UNSUPPORTED_DOCUMENT_TYPE");
  }

  await prisma.documentExtraction.upsert({
    where: {
      documentId: document.id,
    },
    create: {
      documentId: document.id,
      status: DocumentExtractionStatus.PROCESSING,
      extractorVersion: "pdf-parse-v1",
      startedAt: new Date(),
    },
    update: {
      status: DocumentExtractionStatus.PROCESSING,
      extractorVersion: "pdf-parse-v1",
      errorMessage: null,
      startedAt: new Date(),
      completedAt: null,
    },
  });

  try {
    const blob = await get(document.storageKey, {
      access: "private",
    });

    if (!blob) {
      throw new Error("STORED_FILE_NOT_FOUND");
    }

  const arrayBuffer = await new Response(
  blob.stream,
).arrayBuffer();

const pdfData =
  new Uint8Array(arrayBuffer);

const ocrPdfData =
  pdfData.slice();

const parser = new PDFParse({
  data: pdfData,
});
  
    let extractedText = "";

    try {
      const result = await parser.getText();
      extractedText = normalizeText(result.text);
    } finally {
      await parser.destroy();
    }

  let extractorVersion =
  "pdf-parse-v1";

if (!hasMeaningfulExtractedText(extractedText)) {
  console.log(
    "No meaningful embedded PDF text found. Running OCR fallback.",
  );

  const { runPdfOcr } = await import(
  "@/services/document-ocr.service"
);

extractedText = normalizeText(
  await runPdfOcr({
    pdfData: ocrPdfData,
  }),
);

  extractorVersion =
    "tesseract-ocr-v1";
}

if (!hasMeaningfulExtractedText(extractedText)) {
  throw new Error("NO_TEXT_EXTRACTED");
}

const fields =
  extractFields(extractedText);

    const status =
      fields.length > 0
        ? DocumentExtractionStatus.COMPLETED
        : DocumentExtractionStatus.NEEDS_REVIEW;

    return await prisma.$transaction(async (tx) => {
      const extraction =
        await tx.documentExtraction.findUniqueOrThrow({
          where: {
            documentId: document.id,
          },
          select: {
            id: true,
          },
        });

      await tx.extractedField.deleteMany({
        where: {
          extractionId: extraction.id,
        },
      });

      if (fields.length > 0) {
        await tx.extractedField.createMany({
          data: fields.map((field) => ({
            extractionId: extraction.id,
            key: field.key,
            label: field.label,
            type: field.type,
            textValue: field.textValue ?? null,
            numericValue:
              field.numericValue !== undefined
                ? field.numericValue
                : null,
            sourceText: field.sourceText ?? null,
          })),
        });
      }

      return tx.documentExtraction.update({
        where: {
          id: extraction.id,
        },
        data: {
  status,
  extractorVersion,
          /*
           * Deliberately do not persist the full raw tax document
           * text. The original PDF remains in private storage.
           */
          rawText: null,
          errorMessage:
            fields.length === 0
              ? "Text was extracted, but no supported structured fields were identified."
              : null,
          completedAt: new Date(),
        },
        include: {
          fields: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "DOCUMENT_EXTRACTION_FAILED";

    await prisma.documentExtraction.update({
      where: {
        documentId: document.id,
      },
      data: {
        status: DocumentExtractionStatus.FAILED,
        errorMessage: message,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}