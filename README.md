# Mazen's LLM Prototype

A full-stack Next.js App Router prototype that analyzes pasted CV text and uploaded PDF resumes using the Google Gemini API.

## Project Description

This project helps users improve a CV or LinkedIn profile with AI-generated recruiter-style feedback. It supports both pasted text and PDF resume uploads, then returns structured feedback focused on summary improvement, ATS readiness, missing skills, wording quality, and interview preparation.

## Features

- Full-stack Next.js app deployable as one project on Vercel
- App Router UI and API route in the same codebase
- Paste CV text or LinkedIn summary into a textarea
- Upload PDF resumes with drag-and-drop support
- PDF size validation for Vercel-friendly uploads
- Gemini-powered structured analysis
- Result cards for:
  - Overall Score
  - Improved Summary
  - Strengths
  - Weaknesses
  - Missing Skills
  - ATS Suggestions
  - Interview Preparation
  - Rewritten Bullet Points
  - Final Advice

## Tech Stack

- Next.js App Router
- React
- Google Gemini API
- `@google/genai`
- `pdf-parse`
- Plain CSS

## Architecture

```text
CVanalyzer/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── lib/
│   ├── gemini.js
│   └── pdf.js
├── public/
├── package.json
├── next.config.js
├── .env.local
├── .env.example
├── README.md
└── PROPOSAL.md
```

Request flow:

1. The user pastes text or uploads a PDF on `app/page.jsx`.
2. The frontend sends either JSON or `multipart/form-data` to `app/api/analyze/route.js`.
3. The API route reads pasted text directly or extracts text from the PDF in `lib/pdf.js`.
4. The extracted text is sent to Gemini through `lib/gemini.js`.
5. Gemini returns structured JSON.
6. The UI renders the analysis in cards.

## Local Setup

### 1. Install dependencies

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer
npm install
```

### 2. Create local environment file

If `.env.local` does not exist yet, create it in the root folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

There is also a template file:

```text
.env.example
```

### 3. Start the app

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer
npm run dev
```

Open:

```text
http://localhost:3000
```

## Gemini API Key Setup

1. Go to Google AI Studio: https://aistudio.google.com/
2. Create a Gemini API key.
3. Put the key in root `.env.local` as:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Important:

- The API key is only used in server code.
- The frontend never receives the Gemini API key.
- No `VITE_API_URL` or separate backend URL is needed.

## PDF Upload Limitations

- Supported format: PDF only
- Maximum size: 4MB
- Image-only or scanned PDFs may fail if no readable text can be extracted
- Corrupted PDFs return a friendly error message

The 4MB limit is used to stay safer with Vercel serverless request limits.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Choose the framework preset: `Next.js`.
4. Leave the Root Directory empty because the Next.js app is now in the repository root.
5. Add this environment variable in Vercel:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

6. Deploy.

Deployment notes:

- No separate Express backend is needed.
- No Render deployment is needed.
- No backend API URL configuration is needed.
- No `VITE_API_URL` is needed.

## Troubleshooting

- `npm install` fails in the old root setup:
  This migration adds a real root `package.json`, so install from the root now.
- `npm run dev` does not start:
  Make sure dependencies were installed in the root folder, not only in `frontend` or `backend`.
- Gemini errors:
  Verify that `GEMINI_API_KEY` is set in `.env.local` or in Vercel project settings.
- PDF upload rejected:
  Make sure the file is a PDF and under 4MB.
- PDF upload succeeds but analysis fails:
  The PDF may be image-only, scanned, empty, or corrupted.

## Proposal Summary

This is a valid LLM use case because CV review is language-heavy, context-sensitive, and benefits from nuanced coaching rather than rigid rules alone. The app turns unstructured candidate input into predictable structured output, making the feedback useful both to users and to the UI.

## Safe Cleanup After Migration

After verifying the root Next.js app works, these old folders can be deleted safely because they are no longer needed for local development or Vercel deployment:

- `frontend/`
- `backend/`

