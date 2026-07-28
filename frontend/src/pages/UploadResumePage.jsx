import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import { useAnalysis } from "../contexts/AnalysisContext";

export default function UploadResumePage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { loading, resumeText, resumeFileName, uploadResumeFile } = useAnalysis();

  const previewText = useMemo(() => {
    if (!resumeText) {
      return "";
    }

    return resumeText.slice(0, 900);
  }, [resumeText]);

  async function handleUpload(event) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a PDF or DOCX resume file.");
      return;
    }

    try {
      await uploadResumeFile(file);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to upload and parse resume.");
    }
  }

  return (
    <AppShell>
      <section className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="glass-panel animate-rise p-6">
          <h2 className="page-title">Upload Resume</h2>
          <p className="page-subtitle mt-2">
            Upload your latest resume (PDF or DOCX). We will extract and preprocess text for NLP analysis.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleUpload}>
            <label className="block rounded-xl border-2 border-dashed border-slateBlue/25 bg-white/80 p-5 text-sm">
              <span className="block font-semibold text-slateBlue">Select resume file</span>
              <input
                className="mt-3 block w-full text-sm"
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>

            {file ? <p className="text-sm text-ink">Selected: {file.name}</p> : null}
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="button-primary" disabled={loading}>
                {loading ? "Parsing resume..." : "Upload and Parse"}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => navigate("/job-description")}
                disabled={!resumeText}
              >
                Continue to JD
              </button>
            </div>
          </form>
        </div>

        <aside className="glass-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/80">Extracted Text Preview</h3>
          <p className="mt-1 text-xs text-slateBlue/70">File: {resumeFileName || "No file uploaded"}</p>
          <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl bg-white/75 p-4 text-sm leading-6 text-ink">
            {previewText || "Upload a resume to preview extracted text here."}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
