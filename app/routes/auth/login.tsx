import { data, redirect, useActionData } from "react-router";

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
  if (await isAuthenticated(request)) {
    throw redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return data(
      {
        defaultValues: { username },
        errors: { form: "Username and password are required." },
      },
      { status: 400 },
    );
  }

  try {
    const session = await authenticateUser(username, password);

    if (!session) {
      return data(
        {
          defaultValues: { username },
          errors: { form: "Invalid credentials. Try alice / demo-alice." },
        },
        { status: 401 },
      );
    }

    const cookieHeader = await createAuthCookie(request, session);

    return redirect(redirectTo, {
      headers: { "Set-Cookie": cookieHeader },
    });
  } catch (error) {
    return data(
      {
        defaultValues: { username },
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        },
      },
      { status: 502 },
    );
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <AuthScreen
      alternateHref="/register"
      alternateLabel="Create account"
      alternatePrompt="No account yet?"
      defaultValues={actionData?.defaultValues}
      errors={actionData?.errors}
      mode="login"
      submitLabel="Log in"
      title="Login"
    />
  );
}
