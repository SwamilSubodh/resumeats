import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import UploadResumePage from "./pages/UploadResumePage";
import JobDescriptionPage from "./pages/JobDescriptionPage";
import ResultsDashboardPage from "./pages/ResultsDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadResumePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-description"
        element={
          <ProtectedRoute>
            <JobDescriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <ResultsDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
