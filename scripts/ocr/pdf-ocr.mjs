import { readFile } from "node:fs/promises";
import { pdf } from "pdf-to-img";
import { createWorker } from "tesseract.js";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("PDF_PATH_REQUIRED");
  process.exit(1);
}

let worker;
let document;

try {
  const pdfBuffer = await readFile(inputPath);

  const pdfDataUrl =
    `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

  worker = await createWorker("eng");

  document = await pdf(pdfDataUrl, {
    scale: 2,
  });

  const pageTexts = [];

  for await (const image of document) {
    const result = await worker.recognize(image);
    const text = result.data.text.trim();

    if (text) {
      pageTexts.push(text);
    }
  }

  process.stdout.write(
    pageTexts.join("\n\n").trim(),
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (document) {
    await document.destroy();
  }

  if (worker) {
    await worker.terminate();
  }
}