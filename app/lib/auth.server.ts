import { asRecord, fetchBackend, readJson, readString } from "./backend.server";

const SESSION_COOKIE_NAME = "demodeck_session";

export type AuthUser = {
  id: string;
  name: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export async function isAuthenticated(request: Request) {
  const token = getAuthToken(request);

  if (!token) {
    return false;
  }

  const user = await getCurrentUser(token);
  return user !== null;
}

export async function authenticateUser(identifier: string, password: string) {
  let response: Response;

  try {
    response = await fetchBackend("/api/login", {
      body: JSON.stringify({
        username: identifier.trim(),
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await readJson<unknown>(response);
  const payloadRecord = asRecord(payload);
  const token = readString(payloadRecord?.token);

  if (!token) {
    return null;
  }

  const user = parseAuthUser(payloadRecord?.user) ?? (await getCurrentUser(token));

  if (!user) {
    return null;
  }

  return { token, user } satisfies AuthSession;
}

export function createAuthCookie(token: string) {
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=604800",
  ].join("; ");
}

export function destroyAuthCookie() {
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}

export function getAuthToken(request: Request) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...rawValue] = cookie.trim().split("=");

    if (name === SESSION_COOKIE_NAME) {
      return rawValue.join("=") || null;
    }
  }

  return null;
}

export async function getCurrentUser(token: string) {
  let response: Response;

  try {
    response = await fetchBackend("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = await readJson<unknown>(response);
  return parseAuthUser(asRecord(payload)?.user ?? payload);
}

export function getSafeRedirectPath(
  target: FormDataEntryValue | string | null | undefined,
  fallback = "/",
) {
  if (typeof target !== "string") {
    return fallback;
  }

  if (!target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }

  return target;
}

function parseAuthUser(value: unknown) {
  const user = asRecord(value);
  const id = readString(user?.id) ?? readString(user?.userId);
  const name =
    readString(user?.name) ??
    readString(user?.username) ??
    readString(user?.email);

  if (!id || !name) {
    return null;
  }

  return { id, name } satisfies AuthUser;
}
