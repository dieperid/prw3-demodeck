export const AUTH_STORAGE_KEY = "demodeck_auth_session";

export type StoredAuthSession = {
  token: string;
  user: {
    id: string;
    name: string;
  };
};

export function saveAuthSession(session: StoredAuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession);

    if (!isStoredAuthSession(parsedSession)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsedSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const session = value as Record<string, unknown>;
  const user =
    session.user && typeof session.user === "object" && !Array.isArray(session.user)
      ? (session.user as Record<string, unknown>)
      : null;

  return (
    typeof session.token === "string" &&
    session.token.length > 0 &&
    user !== null &&
    typeof user.id === "string" &&
    user.id.length > 0 &&
    typeof user.name === "string" &&
    user.name.length > 0
  );
}
