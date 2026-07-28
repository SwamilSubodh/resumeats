import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  analyzeResume,
  getAnalysisById,
  getAnalysisHistory,
  uploadResume
} from "../api/analysisApi";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadResumeFile = useCallback(async (file) => {
    setLoading(true);
    try {
      const data = await uploadResume(file);
      setResumeText(data.resumeText || "");
      setResumeFileName(data.fileName || file.name || "resume");
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyzeResume({
        resumeText,
        jobDescription
      });

      setCurrentAnalysis(data);
      setHistory((prev) => [
        {
          _id: data.id,
          matchScore: data.matchScore,
          cosineSimilarity: data.cosineSimilarity,
          matchedSkills: data.matchedSkills,
          missingSkills: data.missingSkills,
          suggestions: data.suggestions,
          metrics: data.metrics,
          createdAt: data.createdAt
        },
        ...prev.filter((item) => item._id !== data.id)
      ]);

      return data;
    } finally {
      setLoading(false);
    }
  }, [jobDescription, resumeText]);

  const refreshHistory = useCallback(async (limit = 20) => {
    const data = await getAnalysisHistory(limit);
    setHistory(data.items || []);
    return data.items || [];
  }, []);

  const openAnalysis = useCallback(async (analysisId) => {
    const data = await getAnalysisById(analysisId);
    setCurrentAnalysis({
      id: data.analysis._id,
      matchScore: data.analysis.matchScore,
      cosineSimilarity: data.analysis.cosineSimilarity,
      matchedSkills: data.analysis.matchedSkills,
      missingSkills: data.analysis.missingSkills,
      suggestions: data.analysis.suggestions,
      metrics: data.analysis.metrics,
      createdAt: data.analysis.createdAt
    });

    setJobDescription(data.analysis.jobDescription || "");
    setResumeText(data.analysis.resumeText || "");

    return data.analysis;
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      resumeText,
      resumeFileName,
      jobDescription,
      currentAnalysis,
      history,
      setResumeText,
      setResumeFileName,
      setJobDescription,
      setCurrentAnalysis,
      uploadResumeFile,
      runAnalysis,
      refreshHistory,
      openAnalysis,
      clearCurrentAnalysis
    }),
    [
      clearCurrentAnalysis,
      currentAnalysis,
      history,
      jobDescription,
      loading,
      openAnalysis,
      refreshHistory,
      resumeFileName,
      resumeText,
      runAnalysis,
      uploadResumeFile
    ]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used inside AnalysisProvider.");
  }

  return context;
}
