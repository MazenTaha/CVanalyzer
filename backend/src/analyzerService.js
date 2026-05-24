import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.5-flash";

const analysisSchema = {
  type: "object",
  properties: {
    overallScore: {
      type: "number",
      description: "Overall CV quality score from 0 to 100."
    },
    improvedSummary: {
      type: "string",
      description: "A rewritten professional summary."
    },
    strengths: {
      type: "array",
      description: "Main strengths found in the CV or profile.",
      items: { type: "string" }
    },
    weaknesses: {
      type: "array",
      description: "Main weaknesses or gaps found in the CV or profile.",
      items: { type: "string" }
    },
    missingSkills: {
      type: "array",
      description: "Technical skills the candidate may want to add or learn.",
      items: { type: "string" }
    },
    atsSuggestions: {
      type: "array",
      description: "Suggestions to improve ATS compatibility.",
      items: { type: "string" }
    },
    interviewPreparation: {
      type: "array",
      description: "Interview preparation advice based on the profile.",
      items: { type: "string" }
    },
    rewrittenBulletPoints: {
      type: "array",
      description: "Improved resume bullet points that are clearer and more results-oriented.",
      items: { type: "string" }
    },
    finalAdvice: {
      type: "string",
      description: "Short final advice for the candidate."
    }
  },
  required: [
    "overallScore",
    "improvedSummary",
    "strengths",
    "weaknesses",
    "missingSkills",
    "atsSuggestions",
    "interviewPreparation",
    "rewrittenBulletPoints",
    "finalAdvice"
  ]
};

const fallbackAnalysis = {
  overallScore: 0,
  improvedSummary: "",
  strengths: [],
  weaknesses: [],
  missingSkills: [],
  atsSuggestions: [],
  interviewPreparation: [],
  rewrittenBulletPoints: [],
  finalAdvice: ""
};

function buildPrompt(text) {
  return `You are an expert technical recruiter, ATS optimization specialist, and career coach.
This is a professional CV and LinkedIn profile analysis task.
Analyze the following resume or LinkedIn summary carefully.
Return ONLY valid JSON.
Do not include markdown.
Evaluate the text based on clarity, professionalism, technical strength, ATS readiness, missing skills, and interview readiness.
The user may be a junior software engineer, so make the feedback practical and realistic.
Where the profile is weak, be specific, constructive, and job-focused.

Return JSON with exactly these keys:
{
  "overallScore": number,
  "improvedSummary": string,
  "strengths": string[],
  "weaknesses": string[],
  "missingSkills": string[],
  "atsSuggestions": string[],
  "interviewPreparation": string[],
  "rewrittenBulletPoints": string[],
  "finalAdvice": string
}

CV_OR_LINKEDIN_TEXT:
${text}`;
}

function extractJsonObject(rawText) {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in Gemini response.");
  }

  return rawText.slice(firstBrace, lastBrace + 1);
}

function sanitizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeAnalysis(payload) {
  return {
    overallScore: Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(Number(payload?.overallScore))
          ? Number(payload.overallScore)
          : fallbackAnalysis.overallScore
      )
    ),
    improvedSummary:
      typeof payload?.improvedSummary === "string"
        ? payload.improvedSummary.trim()
        : fallbackAnalysis.improvedSummary,
    strengths: sanitizeStringArray(payload?.strengths),
    weaknesses: sanitizeStringArray(payload?.weaknesses),
    missingSkills: sanitizeStringArray(payload?.missingSkills),
    atsSuggestions: sanitizeStringArray(payload?.atsSuggestions),
    interviewPreparation: sanitizeStringArray(payload?.interviewPreparation),
    rewrittenBulletPoints: sanitizeStringArray(payload?.rewrittenBulletPoints),
    finalAdvice:
      typeof payload?.finalAdvice === "string"
        ? payload.finalAdvice.trim()
        : fallbackAnalysis.finalAdvice
  };
}

function parseGeminiResponse(rawText) {
  try {
    return normalizeAnalysis(JSON.parse(rawText));
  } catch {
    return normalizeAnalysis(JSON.parse(extractJsonObject(rawText)));
  }
}

export async function analyzeProfileText(text, apiKey) {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: buildPrompt(text),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: analysisSchema,
      temperature: 0.5
    }
  });

  const geminiStatus = response?.candidates?.[0]?.finishReason ?? "unknown";
  console.log("Gemini response status:", geminiStatus);

  const rawText = response.text?.trim();

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseGeminiResponse(rawText);
}
