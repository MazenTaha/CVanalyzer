# Proposal: Mazen's LLM Prototype

## 1. Introduction

Mazen's LLM Prototype is a full-stack Next.js application that helps users improve CVs and LinkedIn profiles using the Google Gemini API. It is designed as a clean, deployable prototype that combines frontend and backend logic in one codebase.

## 2. Problem Statement

Many job seekers struggle to understand whether their CV or LinkedIn profile is clear, ATS-friendly, technically convincing, and interview-ready. Professional feedback is helpful, but it is often expensive, slow, or unavailable.

## 3. Proposed Solution

The proposed solution is a full-stack Next.js app where a user can either paste CV or LinkedIn text or upload a PDF resume. The app extracts text when needed, sends it to Gemini, and returns structured recruiter-style feedback that is easy to read and act on.

## 4. Target Users

- Junior software engineers
- Computer science students
- Early-career job seekers
- Users improving LinkedIn summaries
- Supervisors evaluating an LLM prototype for career support

## 5. Why LLM Is Useful Here

This is a strong LLM use case because:

- CV review is heavily language-based
- Good feedback requires interpretation, rewriting, and judgment
- ATS optimization depends on wording and keyword alignment
- Missing skills and interview advice are easier to generate with contextual reasoning
- Structured JSON keeps the output predictable for application use

## 6. Chosen API Provider

Google Gemini API is the chosen LLM provider. It offers a practical free-tier entry point for prototyping and supports structured output through the official JavaScript SDK.

## 7. System Architecture

```text
Next.js Frontend + API Route
           |
           v
      Gemini API
```

Supporting modules:

- `lib/gemini.js` for prompt construction and safe JSON parsing
- `lib/pdf.js` for PDF text extraction and validation

## 8. Workflow

1. The user opens the Next.js app.
2. The user either pastes CV/LinkedIn text or uploads a PDF resume.
3. The UI sends the request to `app/api/analyze/route.js`.
4. The API route validates the input.
5. If a PDF is uploaded, the app extracts readable text from the file.
6. The text is sent to Gemini with a structured analysis prompt.
7. Gemini returns JSON feedback.
8. The app displays the results as cards on the page.

## 9. Expected Output

The system returns:

- Overall score out of 100
- Improved professional summary
- Strengths
- Weaknesses
- Missing skills
- ATS suggestions
- Interview preparation advice
- Rewritten bullet points
- Final advice

## 10. Limitations

- Output quality depends on the quality of the pasted or extracted text
- Image-only scanned PDFs may not provide readable text
- AI feedback may not perfectly match every recruiter or industry
- Free-tier API limits may apply
- This prototype does not yet tailor advice to a specific job description

## 11. Future Enhancements

- Job description matching
- Section-by-section scoring
- DOCX upload support
- Exportable reports
- Multi-language analysis
- Saved analysis history

## 12. Conclusion

This project is a valid full-stack Next.js LLM prototype because it solves a real communication-heavy problem, keeps the Gemini API key on the server, supports both pasted text and PDF resumes, and provides practical ATS suggestions, missing skills guidance, and interview preparation feedback in a single Vercel-deployable app.
