import multer from "multer";
import path from "node:path";
import { ApiError } from "./apiError.js";

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

function isPdfFile(file) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  return extension === ".pdf" || file.mimetype === "application/pdf";
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_PDF_SIZE_BYTES
  },
  fileFilter: (_req, file, callback) => {
    if (!isPdfFile(file)) {
      callback(new ApiError(400, "Only PDF files are supported."));
      return;
    }

    callback(null, true);
  }
});

export const pdfUpload = upload.single("pdf");

export function parseOptionalPdfUpload(req, res, next) {
  if (req.is("multipart/form-data")) {
    pdfUpload(req, res, next);
    return;
  }

  next();
}

export { MAX_PDF_SIZE_BYTES };
