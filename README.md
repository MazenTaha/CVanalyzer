# AI CV & LinkedIn Analyzer

A simple full-stack web app that analyzes pasted CV text or uploaded PDF resumes using the Google Gemini API.

## Project Structure

```text
CVanalyzer/
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── src/
│       ├── analyzerService.js
│       ├── apiError.js
│       ├── pdfService.js
│       ├── server.js
│       └── uploadMiddleware.js
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── config.js
│       ├── main.jsx
│       ├── styles.css
│       └── components/
│           └── ResultCard.jsx
├── README.md
└── PROPOSAL.md
```

## What The App Does

The app accepts either:

- Pasted CV text or LinkedIn summary
- A PDF resume upload

The backend then sends the content to Gemini and returns structured JSON with:

- `overallScore`
- `improvedSummary`
- `strengths`
- `weaknesses`
- `missingSkills`
- `atsSuggestions`
- `interviewPreparation`
- `rewrittenBulletPoints`
- `finalAdvice`

## PDF Support

PDF upload support is now included in the backend and frontend.

### How PDF Upload Works

1. The frontend sends the selected PDF as `multipart/form-data`.
2. The backend uses `multer` to accept the upload in memory.
3. The backend validates that the file is a PDF.
4. The backend uses `pdf-parse` to extract readable text from the file.
5. The extracted text is sent to Gemini for the same analysis flow used by pasted text.
6. The frontend displays the returned analysis in cards.

### Supported Formats

- `.pdf` only

### File Size Limit

- Maximum PDF size: `5MB`

### Required Backend Packages

- `multer`
- `pdf-parse`
- `express`
- `cors`
- `dotenv`
- `@google/genai`

## Why `npm install` Fails In The Root Folder

The root folder does not contain a `package.json`, so there is nothing for npm to install there.

This project has two separate apps:

- `backend/`
- `frontend/`

Run `npm install` inside each one separately.

## Why `cd frontend` Fails From Inside `backend`

If your terminal is currently in:

```text
C:\Users\LOQ\Downloads\CVanalyzer\backend
```

then `frontend` is not inside that folder. It is next to it.

Use:

```powershell
cd ..\frontend
```

## Backend

- Stack: Node.js + Express
- Port: `5000`
- Entry file: `backend/src/server.js`
- Dev command: `npm run dev`
- API route: `POST /api/analyze`

### Backend Input Types

The backend now supports:

- `application/json` for pasted text
- `multipart/form-data` for PDF uploads

### JSON Example

```json
{
  "text": "Junior software engineer with React and Node.js experience..."
}
```

### Multipart Example

Field name:

```text
pdf
```

### Backend Environment Variables

Put your Gemini API key in:

[backend/.env](c:/Users/LOQ/Downloads/CVanalyzer/backend/.env)

Example:

```env
GEMINI_API_KEY=your_real_gemini_api_key_here
PORT=5000
```

Template file:

[backend/.env.example](c:/Users/LOQ/Downloads/CVanalyzer/backend/.env.example)

## Frontend

- Stack: React + Vite
- Port: `5173`
- Dev command: `npm run dev`
- API target: `http://localhost:5000/api/analyze`

The frontend supports:

- textarea input
- PDF file input
- drag-and-drop upload
- loading states for extraction and analysis

## How To Create The `.env` File

If `backend/.env` does not exist, run:

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer\backend
copy .env.example .env
```

Then open the file and set:

```env
GEMINI_API_KEY=your_real_gemini_api_key_here
```

## How To Get A Gemini API Key

1. Open `https://aistudio.google.com/`
2. Sign in with your Google account
3. Create an API key
4. Paste it into `backend/.env`

## Exact Installation Commands

### Backend

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer\backend
npm install
```

### Frontend

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer\frontend
npm install
```

## Exact Commands To Run The Project

### Terminal 1: Backend

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer\backend
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Terminal 2: Frontend

```powershell
cd C:\Users\LOQ\Downloads\CVanalyzer\frontend
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## How To Test The App

1. Start the backend.
2. Start the frontend in a second terminal.
3. Open `http://localhost:5173`.
4. Either paste CV text or upload a PDF file.
5. Click `Analyze`.
6. Review the result cards below the form.

You can also test the backend health route:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{"ok":true}
```

## Example API Response

```json
{
  "overallScore": 78,
  "improvedSummary": "Junior software engineer with hands-on experience building full-stack web applications using React and Node.js, supported by a solid understanding of APIs and modern JavaScript development.",
  "strengths": [
    "Relevant full-stack foundation",
    "Clear exposure to React and Node.js",
    "Shows practical project experience"
  ],
  "weaknesses": [
    "Limited measurable outcomes",
    "Profile may need stronger ATS keywords"
  ],
  "missingSkills": [
    "TypeScript",
    "Testing frameworks",
    "CI/CD basics"
  ],
  "atsSuggestions": [
    "Add a dedicated technical skills section",
    "Use role-specific keywords from target jobs"
  ],
  "interviewPreparation": [
    "Prepare to explain your main projects clearly",
    "Review JavaScript, APIs, and React fundamentals"
  ],
  "rewrittenBulletPoints": [
    "Built responsive full-stack applications using React and Node.js for academic and personal projects.",
    "Developed backend API endpoints and integrated them with frontend user interfaces."
  ],
  "finalAdvice": "Focus on measurable impact, stronger technical keywords, and clearer project outcomes."
}
```

## Troubleshooting

- `npm install` in root fails:
  Run installs only inside `backend` and `frontend`.
- `cd frontend` fails from backend:
  Use `cd ..\frontend`.
- `EADDRINUSE: address already in use :::5000`:
  Another process is already using port `5000`. Stop that process, then run the backend again.
- PDF upload says unsupported file:
  Make sure the file extension is `.pdf`.
- PDF upload says file too large:
  Keep the file under `5MB`.
- PDF upload says it cannot read the file:
  The PDF may be corrupted, scanned as an image, or missing readable text.
- Gemini analysis fails:
  Check that `GEMINI_API_KEY` is set correctly in `backend/.env`.

## Notes

- The Gemini API key stays on the backend only.
- The frontend never receives the API key.
- Text analysis and PDF analysis both use the same Gemini prompt and response format.
- The backend includes safe JSON parsing in case Gemini returns extra formatting.
