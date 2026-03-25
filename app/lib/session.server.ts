import { createCookieSessionStorage } from "react-router";
import { ENV } from "~/config/env.server";
import { createToast, isToast, type Toast, type ToastInput } from "~/lib/toast";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [ENV.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

const TOAST_SESSION_KEY = "toast";

export async function createToastCookie(
  request: Request,
  toast: ToastInput,
): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  flashToast(session, toast);
  return commitSession(session);
}

export async function getToast(
  request: Request,
): Promise<{ headers: HeadersInit | null; toast: Toast | null }> {
  const session = await getSession(request.headers.get("Cookie"));
  const flashedToast = session.get(TOAST_SESSION_KEY);

  if (!isToast(flashedToast)) {
    return { headers: null, toast: null };
  }

  return {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
    toast: flashedToast,
  };
}

export function flashToast(
  session: Awaited<ReturnType<typeof getSession>>,
  toast: ToastInput | Toast,
) {
  session.flash(TOAST_SESSION_KEY, isToast(toast) ? toast : createToast(toast));
}
