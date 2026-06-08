export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://inmobiliariaback-6a58.onrender.com/api";

export async function requestApi(path, init = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    let message = `Error al cargar ${path} (${response.status} ${response.statusText})`;
    const errorBody = await response.text().catch(() => "");
    if (errorBody) message += ` - ${errorBody}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Error parseando JSON de ${path}: ${err.message}`);
  }
}

export async function fetchApi(path) {
  return requestApi(path);
}
