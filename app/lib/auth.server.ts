import type { RegisterPayload } from "~/helpers/auth/validation";

import {
  asRecord,
  fetchBackend,
  readJson,
  readNumber,
  readString,
} from "./backend.server";
import { commitSession, destroySession, getSession } from "./session.server";

const AUTH_SESSION_KEY = "authSession";

export type AuthenticatedUser = {
  id: string;
  username: string;
  name: string;
};

export type AuthSession = {
  token: string;
  user: AuthenticatedUser;
  expiresIn: number | null;
};

export async function authenticateUser(
  username: string,
  password: string,
): Promise<AuthSession | null> {
  if (!username.trim() || !password) {
    return null;
  }

  let response: Response;

  try {
    response = await fetchBackend("/api/login", {
      body: JSON.stringify({ password, username: username.trim() }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    throw new Error("Unable to reach the backend login API.");
  }

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await readBackendError(response, "Unable to authenticate with the backend."),
    );
  }

  const payload = await readJson<unknown>(response);
  const session = await normalizeAuthSession(payload);

  if (!session) {
    throw new Error("The backend login response is missing session data.");
  }

  return session;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthenticatedUser> {
  let response: Response;

  try {
    response = await fetchBackend("/api/users", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    throw new Error("Unable to reach the backend registration API.");
  }

  if (!response.ok) {
    throw new Error(
      await readBackendError(response, "Registration failed. Please try again."),
    );
  }

  const payloadData = await readJson<unknown>(response);
  const payloadRecord = asRecord(payloadData);
  const user =
    normalizeUser(payloadRecord?.user) ??
    normalizeUser(payloadData) ??
    normalizeRegisteredUser(payloadData, payload);

  if (!user) {
    throw new Error("The backend registration response is missing user data.");
  }

  return user;
}

export async function getAuthSession(request: Request): Promise<AuthSession | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const authSession = session.get(AUTH_SESSION_KEY);

  return isAuthSession(authSession) ? authSession : null;
}

export async function getAuthenticatedUser(
  request: Request,
): Promise<AuthenticatedUser | null> {
  return (await getAuthSession(request))?.user ?? null;
}

export async function isAuthenticated(request: Request): Promise<boolean> {
  return (await getAuthSession(request)) !== null;
}

export async function createAuthCookie(
  request: Request,
  authSession: AuthSession,
): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(AUTH_SESSION_KEY, authSession);
  return commitSession(session);
}

export async function destroyAuthCookie(request: Request): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  return destroySession(session);
}

export function getSafeRedirectPath(path: FormDataEntryValue | null): string {
  if (!path || typeof path !== "string" || !path.startsWith("/")) {
    return "/";
  }

  return path;
}

async function normalizeAuthSession(payload: unknown): Promise<AuthSession | null> {
  const record = asRecord(payload);
  const token = readString(record?.token) ?? readString(record?.accessToken);

  if (!token) {
    return null;
  }

  const user = normalizeUser(record?.user);

  if (!user) {
    return null;
  }

  return {
    expiresIn: readNumber(record?.expiresIn),
    token,
    user,
  };
}

function normalizeUser(value: unknown): AuthenticatedUser | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const id = readString(record.id) ?? readString(record.userId);
  const username = readString(record.username) ?? readString(record.login);
  const name =
    readString(record.name) ?? readString(record.fullName) ?? username ?? null;

  if (!id || !username || !name) {
    return null;
  }

  return { id, name, username };
}

function normalizeRegisteredUser(
  value: unknown,
  payload: RegisterPayload,
): AuthenticatedUser | null {
  const record = asRecord(value);
  const id = readString(record?.id) ?? readString(asRecord(record?.user)?.id);

  if (!id) {
    return null;
  }

  return {
    id,
    name: payload.name,
    username: payload.username,
  };
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const session = value as Record<string, unknown>;

  return (
    typeof session.token === "string" &&
    session.token.length > 0 &&
    typeof session.expiresIn !== "undefined" &&
    normalizeUser(session.user) !== null
  );
}

async function readBackendError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const payload = await readJson<unknown>(response).catch(() => null);
  const record = asRecord(payload);

  return (
    readString(record?.message) ??
    readString(record?.error) ??
    fallbackMessage
  );
}
