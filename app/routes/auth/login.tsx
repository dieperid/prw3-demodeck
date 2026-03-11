import { redirect } from "react-router";

import type { Route } from "./+types/login";
import { AuthScreen } from "~/components/AuthScreen";
import {
  authenticateUser,
  createAuthCookie,
  getSafeRedirectPath,
  isAuthenticated,
} from "~/lib/auth.server";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Login | DemoDeck" },
    {
      name: "description",
      content:
        "User login screen for DemoDeck, with email and password fields.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  if (isAuthenticated(request)) {
    throw redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  const session = authenticateUser(identifier, password);

  if (!session) {
    return new Response(
      JSON.stringify({
        error: "Invalid credentials. Try student / password.",
        success: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 401,
      },
    );
  }

  return new Response(
    JSON.stringify({
      redirectTo,
      success: true,
      token: session.token,
      user: session.user,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": createAuthCookie(session.token),
      },
    },
  );
}

export default function Login() {
  return (
    <AuthScreen
      alternateHref="/register"
      alternateLabel="Create account"
      alternatePrompt="No account yet?"
      enableClientAuth
      submitLabel="Log in"
      title="Login"
    />
  );
}
