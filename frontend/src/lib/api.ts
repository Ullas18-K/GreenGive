const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  // Helps catch misconfigured deployments early.
  throw new Error("VITE_API_BASE_URL is not set");
}

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const buildApiUrl = (path: string) => `${apiBaseUrl}${normalizePath(path)}`;

export const apiFetch = async (path: string, init?: RequestInit) => {
  const response = await fetch(buildApiUrl(path), init);

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response;
};
