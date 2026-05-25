import { NextResponse } from "next/server";
import { analyzeProfileText } from "../../../lib/gemini";
import { extractTextFromPdf } from "../../../lib/pdf";

export const runtime = "nodejs";

async function getRequestPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();

    return {
      text: typeof formData.get("text") === "string" ? formData.get("text").trim() : "",
      pdf: formData.get("pdf")
    };
  }

  if (contentType.includes("application/json")) {
    const body = await request.json();

    return {
      text: typeof body?.text === "string" ? body.text.trim() : "",
      pdf: null
    };
  }

  return { text: "", pdf: null };
}

export async function POST(request) {
  try {
    const { text, pdf } = await getRequestPayload(request);

    if (!text && !(pdf instanceof File && pdf.size > 0)) {
      return NextResponse.json(
        { error: "Please paste CV text or upload a PDF resume." },
        { status: 400 }
      );
    }

    let sourceText = text;

    if (!sourceText && pdf instanceof File && pdf.size > 0) {
      sourceText = await extractTextFromPdf(pdf);
    }

    const analysis = await analyzeProfileText(sourceText);

    return NextResponse.json(analysis);
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : 500;

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to analyze the profile right now. Please try again."
      },
      { status }
    );
  }
}

