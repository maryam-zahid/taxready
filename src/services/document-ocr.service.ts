import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type RunPdfOcrInput = {
  pdfData: Uint8Array;
};

export async function runPdfOcr(
  input: RunPdfOcrInput,
) {
  const tempDirectory = await mkdtemp(
    path.join(tmpdir(), "taxready-ocr-"),
  );

  const pdfPath = path.join(
    tempDirectory,
    "document.pdf",
  );

  try {
    await writeFile(
      pdfPath,
      Buffer.from(input.pdfData),
    );

    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "ocr",
      "pdf-ocr.mjs",
    );

    const { stdout } = await execFileAsync(
      process.execPath,
      [scriptPath, pdfPath],
      {
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true,
      },
    );

    return stdout.trim();
  } finally {
    await rm(tempDirectory, {
      recursive: true,
      force: true,
    });
  }
}