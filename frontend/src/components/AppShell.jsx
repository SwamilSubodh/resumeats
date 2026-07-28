import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";

import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/upload", label: "Upload Resume" },
  { to: "/job-description", label: "Job Description" },
  { to: "/results", label: "Results Dashboard" }
];

export default function AppShell({ children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutUser();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-sea">AI Resume Intelligence</p>
            <h1 className="text-lg font-bold text-ink">Resume-JD Matcher</h1>
          </div>

          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    isActive ? "bg-slateBlue text-white" : "text-slateBlue hover:bg-slateBlue/10"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-xs uppercase tracking-wide text-slateBlue/70">Signed in as</p>
              <p className="text-sm font-semibold text-ink">{user?.name || "User"}</p>
            </div>
            <button type="button" onClick={handleLogout} className="button-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 max-w-6xl px-4 md:px-6">{children}</main>
    </div>
  );
}
