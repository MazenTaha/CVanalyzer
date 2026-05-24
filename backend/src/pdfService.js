import { PDFParse } from "pdf-parse";
import { ApiError } from "./apiError.js";

export async function extractTextFromPdf(fileBuffer) {
  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    const extractedText = result?.text?.trim() ?? "";

    console.log("Extracted PDF text length:", extractedText.length);

    if (!extractedText) {
      throw new ApiError(
        400,
        "The uploaded PDF does not contain readable text. Please upload a text-based PDF resume."
      );
    }

    return extractedText;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("PDF extraction failed:", error);

    throw new ApiError(
      400,
      "Unable to read this PDF. The file may be corrupted, scanned as an image, or unsupported."
    );
  } finally {
    await parser.destroy();
  }
}

