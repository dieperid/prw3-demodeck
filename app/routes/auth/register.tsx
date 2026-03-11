import { data, redirect, useActionData } from "react-router";
import type { Route } from "./+types/register";

import { validateRegistrationData } from "~/helpers/auth/validation";
import { AuthScreen } from "~/components/AuthScreen";
import {
  authenticateUser,
  createAuthCookie,
  getSafeRedirectPath,
  isAuthenticated,
  registerUser,
} from "~/lib/auth.server";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Register | DemoDeck" },
    {
      name: "description",
      content: "Creation de compte pour acceder aux routes protegees.",
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

  const { isValid, errors, payload } = validateRegistrationData(formData);

  if (!isValid) {
    return data(
      {
        errors,
        defaultValues: { username: payload.username, name: payload.name },
      },
      { status: 400 },
    );
  }

  try {
    await registerUser(payload);
    const session = await authenticateUser(payload.username, payload.password);

    if (!session) {
      return data(
        {
          errors: {
            form: "Account created, but automatic login failed. Please sign in.",
          },
          defaultValues: { username: payload.username, name: payload.name },
        },
        { status: 502 },
      );
    }

    const cookieHeader = await createAuthCookie(request, session);

    return redirect(redirectTo, {
      headers: { "Set-Cookie": cookieHeader },
    });
  } catch (error) {
    return data(
      {
        errors: {
          form:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        },
        defaultValues: { username: payload.username, name: payload.name },
      },
      { status: 400 },
    );
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <AuthScreen
      alternateHref="/login"
      alternateLabel="Sign in"
      alternatePrompt="Already registered?"
      mode="register"
      submitLabel="Create account"
      title="Registration"
      errors={actionData?.errors}
      defaultValues={actionData?.defaultValues}
    />
  );
}
