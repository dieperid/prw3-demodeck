import { getSession, commitSession, destroySession } from "./session.server";

export async function isAuthenticated(request: Request): Promise<boolean> {
  const session = await getSession(request.headers.get("Cookie"));
  return session.has("userId");
}

export async function createAuthCookie(
  request: Request,
  userId: string,
): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", userId);
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
