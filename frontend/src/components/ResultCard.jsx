export function ResultCard({ title, children, accent = false }) {
  return (
    <article className={`result-card${accent ? " result-card-accent" : ""}`}>
      <h2>{title}</h2>
      <div className="result-content">{children}</div>
    </article>
  );
}

