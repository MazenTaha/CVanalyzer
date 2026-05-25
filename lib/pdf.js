import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024;

function createPdfError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPdfFile(file) {
  return (
    file &&
    (file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf"))
  );
}

export async function extractTextFromPdf(file) {
  if (!(file instanceof File)) {
    throw createPdfError("Please upload a PDF resume.");
  }

  if (!isPdfFile(file)) {
    throw createPdfError("Only PDF files are supported.");
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw createPdfError("PDF file is too large. Maximum size is 4MB.");
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await pdfParse(fileBuffer);
    const extractedText = result?.text?.trim() ?? "";

    if (!extractedText) {
      throw createPdfError(
        "The uploaded PDF does not contain readable text. Please upload a text-based resume PDF."
      );
    }

    return extractedText;
  } catch (error) {
    if (error?.statusCode) {
      throw error;
    }

    throw createPdfError(
      "Unable to read this PDF. It may be corrupted, image-only, or unsupported."
    );
  }
}
