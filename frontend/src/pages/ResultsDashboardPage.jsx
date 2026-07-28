import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import ScoreProgress from "../components/ScoreProgress";
import SkillsComparison from "../components/SkillsComparison";
import SuggestionsList from "../components/SuggestionsList";
import KeywordHighlighter from "../components/KeywordHighlighter";
import HistoryPanel from "../components/HistoryPanel";
import { useAnalysis } from "../contexts/AnalysisContext";
import { downloadAnalysisReport } from "../api/analysisApi";
import { generateLocalPdfReport, saveBlobAsFile } from "../utils/reportGenerator";

function MetricCard({ label, value }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-xs uppercase tracking-wide text-slateBlue/70">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

export default function ResultsDashboardPage() {
  const {
    currentAnalysis,
    jobDescription,
    loading,
    history,
    refreshHistory,
    openAnalysis
  } = useAnalysis();

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    refreshHistory().catch(() => {
      setError("Could not load analysis history.");
    });
  }, [refreshHistory]);

  async function handleOpenHistory(analysisId) {
    setError("");
    try {
      await openAnalysis(analysisId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Failed to open selected analysis.");
    }
  }

  async function handleDownloadReport() {
    if (!currentAnalysis) {
      return;
    }

    try {
      if (currentAnalysis.id) {
        const blob = await downloadAnalysisReport(currentAnalysis.id);
        saveBlobAsFile(blob, `analysis-${currentAnalysis.id}.pdf`);
        return;
      }

      generateLocalPdfReport(currentAnalysis);
    } catch {
      generateLocalPdfReport(currentAnalysis);
    }
  }

  if (!currentAnalysis) {
    return (
      <AppShell>
        <section className="glass-panel animate-rise p-6">
          <h2 className="page-title">Results Dashboard</h2>
          <p className="page-subtitle mt-2">Run an analysis to see score, skill gaps, and suggestions.</p>
          <button type="button" className="button-primary mt-5" onClick={() => navigate("/upload")}>
            Start New Analysis
          </button>
        </section>

        <div className="mt-5">
          <HistoryPanel items={history} onSelect={handleOpenHistory} />
        </div>
      </AppShell>
    );
  }

  const metrics = currentAnalysis.metrics || {};
  //console.log("FULL ANALYSIS:", currentAnalysis);

  return (
    <AppShell>
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="page-title">Results Dashboard</h2>
          <div className="flex gap-2">
            <button type="button" className="button-secondary" onClick={() => navigate("/upload")}>
              New Analysis
            </button>
            <button type="button" className="button-primary" onClick={handleDownloadReport}>
              Download PDF Report
            </button>
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

        <ScoreProgress score={currentAnalysis.matchScore} />

        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
            Score Breakdown
          </h3>

          <div className="mt-3 space-y-2 text-sm text-green-700">
            <p>How likely is this resume a good fit for this JD?  <b>{currentAnalysis.scoreBreakdown?.ml}%</b></p>
            <p>Do these two texts mean similar things?  <b>{currentAnalysis.scoreBreakdown?.semantic}%</b></p>
            <p>How many important words match? <b>{currentAnalysis.scoreBreakdown?.tfidf}%</b></p>
            <p>Percentage of JD skills present in resume? <b>{currentAnalysis.scoreBreakdown?.skills}%</b></p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Cosine Similarity" value={`${Math.round((currentAnalysis.cosineSimilarity || 0) * 100)}%`} />
          <MetricCard label="Precision" value={`${((metrics.precision || 0) * 100).toFixed(1)}%`} />
          <MetricCard label="Recall" value={`${((metrics.recall || 0) * 100).toFixed(1)}%`} />
          <MetricCard label="F1 Score" value={`${((metrics.f1Score || 0) * 100).toFixed(1)}%`} />
        </div>

        <SkillsComparison
          matchedSkills={currentAnalysis.matchedSkills || []}
          missingSkills={currentAnalysis.missingSkills || []}
        />

        <SuggestionsList suggestions={currentAnalysis.suggestions || []} />

        <KeywordHighlighter
          text={jobDescription}
          missingSkills={currentAnalysis.missingSkills || []}
          matchedSkills={currentAnalysis.matchedSkills || []}
        />

        <HistoryPanel items={history} onSelect={handleOpenHistory} />

        {loading ? <p className="text-sm font-semibold text-slateBlue/75">Loading...</p> : null}
      </section>
    </AppShell>
  );
}
