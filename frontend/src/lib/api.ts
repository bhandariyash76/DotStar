const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

interface ApiOptions extends RequestInit {
  token?: string | null;
}

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: ApiOptions = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data as T;
}
