import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import { useAnalysis } from "../contexts/AnalysisContext";

export default function JobDescriptionPage() {
  const {
    resumeText,
    jobDescription,
    setJobDescription,
    runAnalysis,
    loading,
    clearCurrentAnalysis
  } = useAnalysis();

  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!resumeText) {
    return <Navigate to="/upload" replace />;
  }

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    try {
      clearCurrentAnalysis();
      await runAnalysis();
      navigate("/results");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to analyze resume against job description.");
    }
  }

  return (
    <AppShell>
      <section className="glass-panel animate-rise p-6">
        <h2 className="page-title">Job Description Input</h2>
        <p className="page-subtitle mt-2">
          Paste the job description to compute semantic similarity, matched skills, and resume improvement tips.
        </p>

        <form className="mt-6" onSubmit={handleAnalyze}>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slateBlue/75">Job Description</span>
            <textarea
              className="input-base min-h-[320px] resize-y"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste complete JD here..."
              required
            />
          </label>

          {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="button-primary" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Match"}
            </button>
            <button type="button" className="button-secondary" onClick={() => navigate("/upload")}>
              Back to Upload
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
