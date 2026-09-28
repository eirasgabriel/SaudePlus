const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("saudeplus-token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro ao consultar a API (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export { API_BASE_URL, apiFetch };
