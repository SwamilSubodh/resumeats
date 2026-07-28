import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const { isAuthenticated, loginUser, registerUser, actionLoading } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/upload" replace />;
  }

  const from = location.state?.from || "/upload";

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (mode === "register") {
        await registerUser(formData);
      } else {
        await loginUser({ email: formData.email, password: formData.password });
      }

      navigate(from, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Authentication failed.");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <section className="glass-panel w-full animate-rise p-7">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sea">Secure Workspace</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-slateBlue/80">
          Access your AI-powered resume matching dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slateBlue/75">Full name</span>
              <input
                className="input-base"
                name="name"
                placeholder="Priya Sharma"
                value={formData.name}
                onChange={updateField}
                required
              />
            </label>
          ) : null}

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slateBlue/75">Email</span>
            <input
              className="input-base"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={updateField}
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slateBlue/75">Password</span>
            <input
              className="input-base"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={updateField}
              required
            />
          </label>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <button type="submit" className="button-primary w-full" disabled={actionLoading}>
            {actionLoading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm font-semibold text-slateBlue hover:text-ink"
          onClick={() => {
            setMode((prev) => (prev === "login" ? "register" : "login"));
            setError("");
          }}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
        </button>
      </section>
    </div>
  );
}
