# Proposal: AI CV & LinkedIn Profile Analyzer

## 1. Introduction

The AI CV & LinkedIn Profile Analyzer is a lightweight web application that helps users improve the quality of their professional profiles using an LLM. It focuses on practical, fast feedback that can support job seekers during CV writing and LinkedIn optimization.

## 2. Problem Statement

Job seekers often submit CVs and LinkedIn profiles that are technically correct but weak in clarity, ATS formatting, keyword usage, or positioning. Many users do not know how recruiters interpret their profiles, and professional review services may be expensive or unavailable.

## 3. Proposed Solution

The proposed solution is a simple web app where the user pastes CV text or a LinkedIn summary into a form. The backend sends that text to the Google Gemini API with a structured prompt and returns analysis in machine-readable JSON. The frontend then displays the output in clearly labeled sections.

## 4. Target Users

- Junior software engineers
- Computer science students
- Early-career developers
- Job seekers improving LinkedIn profiles
- Supervisors or instructors evaluating LLM prototype use cases

## 5. Why LLM Is Useful Here

This problem is well suited to an LLM because:

- CV and profile review is mostly language-based
- Feedback needs interpretation, rewriting, and judgment
- The same text can be improved in multiple useful ways
- Users benefit from natural-language coaching rather than keyword matching alone
- Structured JSON allows LLM creativity while keeping output predictable for the UI

## 6. Chosen Free API Provider

Google Gemini API is used as the LLM provider for this prototype. It is suitable for free-tier prototyping, accessible through Google AI Studio, and offers an official JavaScript SDK for backend integration.

## 7. System Architecture

```text
Frontend (React + Vite)
        |
        v
Backend API (Node.js + Express)
        |
        v
Google Gemini API
```

## 8. Workflow

1. User pastes CV text or LinkedIn summary into the frontend.
2. User clicks the Analyze button.
3. Frontend sends the text to the backend using `POST /api/analyze`.
4. Backend validates that the text is not empty.
5. Backend prompts Gemini to return structured JSON only.
6. Backend parses and normalizes the response.
7. Frontend shows the results in organized cards.

## 9. Expected Output

The system returns:

- Overall score out of 100
- Improved professional summary
- Strengths
- Weaknesses
- Missing technical skills
- ATS optimization suggestions
- Interview preparation advice
- Rewritten bullet points
- Final advice

## 10. Limitations

- Output quality depends on the pasted text quality
- AI feedback may not fully match every industry or hiring manager
- No file upload or document parsing in this prototype
- No job-description matching in the first version
- Free-tier API limits may apply

## 11. Future Enhancements

- Add PDF and DOCX upload support
- Add job description comparison
- Add role-specific analysis templates
- Add exportable reports
- Add analytics dashboard
- Add multilingual support

## 12. Conclusion

This project is a valid and practical LLM prototype because it solves a real communication-heavy problem, uses structured AI output, protects the API key on the server, and demonstrates clear value with a minimal full-stack architecture.
