import apiClient from "./client";

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await apiClient.post("/api/resume/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
}

export async function analyzeResume(payload) {
  const response = await apiClient.post("/api/analyze", payload);
  return response.data;
}

export async function getAnalysisHistory(limit = 20) {
  const response = await apiClient.get(`/api/analyze/history?limit=${limit}`);
  return response.data;
}

export async function getAnalysisById(analysisId) {
  const response = await apiClient.get(`/api/analyze/${analysisId}`);
  return response.data;
}

export async function downloadAnalysisReport(analysisId) {
  const response = await apiClient.get(`/api/analyze/${analysisId}/report`, {
    responseType: "blob"
  });

  return response.data;
}
