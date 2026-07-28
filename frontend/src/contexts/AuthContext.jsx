import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getMe, login, logout, register } from "../api/authApi";
import {
  clearToken,
  clearUser,
  getToken,
  getUser,
  setToken,
  setUser
} from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getUser());
  const [initializing, setInitializing] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function hydrateSession() {
      const existingToken = getToken();
      if (!existingToken) {
        setInitializing(false);
        return;
      }

      try {
        const data = await getMe();
        setUserState(data.user);
        setUser(data.user);
      } catch {
        clearToken();
        clearUser();
        setTokenState(null);
        setUserState(null);
      } finally {
        setInitializing(false);
      }
    }

    hydrateSession();
  }, []);

  async function loginUser(payload) {
    setActionLoading(true);
    try {
      const data = await login(payload);
      setToken(data.token);
      setUser(data.user);
      setTokenState(data.token);
      setUserState(data.user);
      return data;
    } finally {
      setActionLoading(false);
    }
  }

  async function registerUser(payload) {
    setActionLoading(true);
    try {
      const data = await register(payload);
      setToken(data.token);
      setUser(data.user);
      setTokenState(data.token);
      setUserState(data.user);
      return data;
    } finally {
      setActionLoading(false);
    }
  }

  async function logoutUser() {
    try {
      await logout();
    } catch {
      // Ignore network/API failures during client-side logout cleanup.
    }

    clearToken();
    clearUser();
    setTokenState(null);
    setUserState(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      actionLoading,
      isAuthenticated: Boolean(token),
      loginUser,
      registerUser,
      logoutUser
    }),
    [token, user, initializing, actionLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
