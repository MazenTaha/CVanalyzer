"use client";

import { useRef, useState } from "react";

const MAX_PDF_SIZE_MB = 4;
const emptyResult = null;

const resultSections = [
  { key: "strengths", title: "Strengths", type: "list" },
  { key: "weaknesses", title: "Weaknesses", type: "list" },
  { key: "missingSkills", title: "Missing Technical Skills", type: "list" },
  { key: "atsSuggestions", title: "ATS Suggestions", type: "list" },
  { key: "interviewPreparation", title: "Interview Preparation", type: "list" },
  { key: "rewrittenBulletPoints", title: "Rewritten Bullet Points", type: "list" }
];

function ResultCard({ title, children, accent = false }) {
  return (
    <article className={`result-card${accent ? " result-card-accent" : ""}`}>
      <h2>{title}</h2>
      <div className="result-content">{children}</div>
    </article>
  );
}

function isPdfFile(file) {
  return (
    file &&
    (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
  );
}

export default function HomePage() {
  const fileInputRef = useRef(null);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState(emptyResult);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing CV...");

  const trimmedText = text.trim();
  const hasInput = Boolean(trimmedText || selectedFile);
  const isSubmitDisabled = loading || !hasInput;
  const scoreDegrees = result ? `${Math.round((result.overallScore / 100) * 360)}deg` : "0deg";

  function handleFileSelection(file) {
    if (!file) {
      return;
    }

    if (!isPdfFile(file)) {
      setSelectedFile(null);
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > MAX_PDF_SIZE_MB * 1024 * 1024) {
      setSelectedFile(null);
      setError(`PDF file is too large. Maximum size is ${MAX_PDF_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  function handleFileChange(event) {
    const [file] = event.target.files || [];
    handleFileSelection(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    const [file] = event.dataTransfer.files || [];
    handleFileSelection(file);
  }

  function removeSelectedFile() {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function parseApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const textBody = await response.text();

    return {
      error: textBody || "The server returned an unexpected response."
    };
  }

  async function handleAnalyze(event) {
    event.preventDefault();

    if (!trimmedText && !selectedFile) {
      setError("Please paste CV text or upload a PDF before analyzing.");
      return;
    }

    setLoading(true);
    setLoadingMessage(trimmedText ? "Analyzing CV..." : "Extracting PDF...");
    setError("");
    setResult(emptyResult);

    let loadingTimerId;

    try {
      let response;

      if (trimmedText) {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: trimmedText })
        });
      } else {
        const formData = new FormData();
        formData.append("pdf", selectedFile);

        // The backend extracts text and then analyzes it in the same request.
        loadingTimerId = window.setTimeout(() => {
          setLoadingMessage("Analyzing CV...");
        }, 900);

        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData
        });
      }

      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
    } catch (requestError) {
      if (requestError instanceof TypeError) {
        setError(
          "Unable to reach the analysis service. Please make sure the app is running and check the server logs."
        );
      } else {
        setError(requestError.message || "Something went wrong while analyzing.");
      }
    } finally {
      if (loadingTimerId) {
        window.clearTimeout(loadingTimerId);
      }

      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <main className="app">
        <section className="hero">
          <span className="eyebrow">Mazen&apos;s LLM Prototype</span>
          <h1>AI CV & LinkedIn Profile Analyzer</h1>
          <p className="hero-copy">
            Paste CV text or upload a PDF resume to get recruiter-style feedback,
            ATS suggestions, missing skill recommendations, and interview preparation
            advice in one place.
          </p>
        </section>

        <section className="panel input-panel">
          <form onSubmit={handleAnalyze}>
            <div className="input-grid">
              <div className="input-column">
                <div className="input-header">
                  <label className="field-label" htmlFor="profileText">
                    Paste CV or LinkedIn Text
                  </label>
                </div>
                <textarea
                  id="profileText"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste the candidate's CV text or LinkedIn summary here..."
                  rows={14}
                />
              </div>

              <div className="or-divider" aria-hidden="true">
                <span>OR</span>
              </div>

              <div className="input-column">
                <div className="input-header">
                  <label className="field-label" htmlFor="resumePdf">
                    Upload PDF Resume
                  </label>
                </div>

                <div
                  className={`dropzone${dragActive ? " dropzone-active" : ""}`}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    id="resumePdf"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    hidden
                  />
                  <div className="dropzone-icon">PDF</div>
                  <p className="dropzone-title">Drag and drop a PDF resume here</p>
                  <p className="dropzone-copy">or click to browse your files</p>
                  <p className="dropzone-meta">Supported format: PDF only, up to 4MB</p>
                </div>

                {selectedFile ? (
                  <div className="file-chip">
                    <div>
                      <span className="file-chip-label">Selected file</span>
                      <p>{selectedFile.name}</p>
                    </div>
                    <button
                      className="file-chip-remove"
                      type="button"
                      onClick={removeSelectedFile}
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="actions">
              <button type="submit" disabled={isSubmitDisabled}>
                {loading ? loadingMessage : "Analyze"}
              </button>
            </div>
          </form>
          {error ? <p className="error-message">{error}</p> : null}
        </section>

        {result ? (
          <section className="results">
            <div className="results-grid">
              <ResultCard title="Overall Score" accent>
                <div className="score-wrap">
                  <div className="score-ring" style={{ "--score-degrees": scoreDegrees }}>
                    <span>{result.overallScore}</span>
                  </div>
                  <p>out of 100</p>
                </div>
              </ResultCard>

              <ResultCard title="Improved Summary" accent>
                <p>{result.improvedSummary}</p>
              </ResultCard>

              {resultSections.map((section) => (
                <ResultCard key={section.key} title={section.title}>
                  {section.type === "list" && result[section.key]?.length ? (
                    <ul>
                      {result[section.key].map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No suggestions returned for this section.</p>
                  )}
                </ResultCard>
              ))}

              <ResultCard title="Final Advice" accent>
                <p>{result.finalAdvice}</p>
              </ResultCard>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
