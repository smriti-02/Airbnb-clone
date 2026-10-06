export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Get user from local storage
  let userId = "";
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("airbnb_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id) {
          userId = user.id.toString();
        }
      } catch (e) {}
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
