const DEFAULT_BACKEND_API_URL = "http://localhost:3000";

type JsonRecord = Record<string, unknown>;

export function getBackendApiUrl() {
  return process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL;
}

export async function fetchBackend(
  path: string,
  init: RequestInit = {},
) {
  const url = new URL(path, getBackendApiUrl());
  const headers = new Headers(init.headers);
  
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  
  return fetch(url, {
    ...init,
    headers,
  });
}

export async function readJson<T>(response: Response) {
  if (response.status === 204) {
    return null as T | null;
  }

  const text = await response.text();

  if (!text) {
    return null as T | null;
  }

  return JSON.parse(text) as T;
}

export function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

export function readString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "bigint") {
    return String(value);
  }

  return null;
}

export function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function readStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => readString(item))
    .filter((item): item is string => item !== null);
}
