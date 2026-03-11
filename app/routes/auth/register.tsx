import { data, redirect, useActionData } from "react-router";
import type { Route } from "./+types/register";

import { validateRegistrationData } from "~/helper/auth/validation";
import { registerUserApi } from "~/services/auth.server";
import { AuthScreen } from "~/components/AuthScreen";
import {
  createAuthCookie,
  getSafeRedirectPath,
  isAuthenticated,
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
    const user = await registerUserApi(payload);

    const cookieHeader = await createAuthCookie(request, user.id);

    return redirect(redirectTo, {
      headers: { "Set-Cookie": cookieHeader },
    });
  } catch (error: any) {
    return data(
      {
        errors: { form: error.message || "An unexpected error occurred." },
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
      submitLabel="Create account"
      title="Inscription"
      errors={actionData?.errors}
      defaultValues={actionData?.defaultValues}
    />
  );
}
