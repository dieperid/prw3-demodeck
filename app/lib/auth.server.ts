const SESSION_COOKIE_NAME = "demodeck_session";
const DEMO_AUTH_USER = {
  id: "student-1",
  name: "Student Demo",
  identifier: "student",
  password: "password",
};

export type AuthUser = {
  id: string;
  name: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function isAuthenticated(request: Request) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader) {
    return false;
  }

  return cookieHeader.split(";").some((cookie) => {
    const [name, value] = cookie.trim().split("=");

    return name === SESSION_COOKIE_NAME && Boolean(value);
  });
}

export function authenticateUser(identifier: string, password: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (
    normalizedIdentifier !== DEMO_AUTH_USER.identifier ||
    password !== DEMO_AUTH_USER.password
  ) {
    return null;
  }

  return {
    token: createFakeJwt(DEMO_AUTH_USER.id),
    user: {
      id: DEMO_AUTH_USER.id,
      name: DEMO_AUTH_USER.name,
    },
  } satisfies AuthSession;
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

function createFakeJwt(subject: string) {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      sub: subject,
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const signature = toBase64Url("demodeck-signature");

  return `${header}.${payload}.${signature}`;
}

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
