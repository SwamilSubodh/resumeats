import apiClient from "./client";

export async function register(payload) {
  const response = await apiClient.post("/api/auth/register", payload);
  return response.data;
}

export async function login(payload) {
  const response = await apiClient.post("/api/auth/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get("/api/auth/me");
  return response.data;
}

export async function logout() {
  const response = await apiClient.post("/api/auth/logout");
  return response.data;
}
