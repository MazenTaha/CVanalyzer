import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { ApiError } from "./apiError.js";
import { analyzeProfileText } from "./analyzerService.js";
import { extractTextFromPdf } from "./pdfService.js";
import { ensurePortAvailable } from "./portUtils.js";
import { MAX_PDF_SIZE_BYTES, parseOptionalPdfUpload } from "./uploadMiddleware.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/analyze", parseOptionalPdfUpload, async (req, res, next) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  const uploadedPdf = req.file;

  if (!text && !uploadedPdf) {
    return res.status(400).json({
      error: "Please paste CV text or upload a PDF resume."
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Missing GEMINI_API_KEY on the server."
    });
  }

  try {
    let sourceText = text;
    let sourceType = "text";

    // If pasted text is missing, we fall back to extracting text from the uploaded PDF.
    if (!sourceText && uploadedPdf) {
      console.log("Uploaded PDF filename:", uploadedPdf.originalname);
      sourceText = await extractTextFromPdf(uploadedPdf.buffer);
      sourceType = "pdf";
    }

    console.log(`Starting Gemini analysis using ${sourceType} input.`);

    const analysis = await analyzeProfileText(sourceText, process.env.GEMINI_API_KEY);
    return res.json(analysis);
  } catch (error) {
    return next(error);
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: `PDF file is too large. Maximum size is ${MAX_PDF_SIZE_BYTES / (1024 * 1024)}MB.`
      });
    }

    return res.status(400).json({
      error: err.message
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON payload."
    });
  }

  console.error("Unhandled server error:", err);

  res.status(500).json({
    error:
      "Unable to analyze the profile right now. Please verify the input file and Gemini API configuration."
  });
});

async function startServer() {
  try {
    await ensurePortAvailable(port);

    console.log("[Server] Starting Express server...");

    app.listen(port, () => {
      console.log(`[Server] Running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(`[Server] ${error.message}`);
    process.exitCode = 1;
  }
}

startServer();
