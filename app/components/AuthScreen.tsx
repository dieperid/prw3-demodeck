import { Form, Link, useNavigation } from "react-router";

interface AuthScreenProps {
  title: string;
  submitLabel: string;
  alternatePrompt: string;
  alternateLabel: string;
  alternateHref: string;
  mode: "login" | "register";
  errors?: Record<string, string>;
  defaultValues?: Record<string, string>;
}

export function AuthScreen({
  title,
  submitLabel,
  alternatePrompt,
  alternateLabel,
  alternateHref,
  mode,
  errors,
  defaultValues,
}: AuthScreenProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isRegistration = mode === "register";

  return (
    <div className="mx-auto max-w-md mt-12 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-stone-950">
        {title}
      </h1>

      {errors?.form && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          {errors.form}
        </div>
      )}

      <Form method="post" className="space-y-4">
        {/* Hidden field to handle redirection after success */}
        <input type="hidden" name="redirectTo" value="/" />

        {isRegistration && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-stone-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={defaultValues?.name}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
            />
            {errors?.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-stone-700"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={defaultValues?.username}
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
          />
          {errors?.username && (
            <p className="text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-stone-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
          />
          {errors?.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-full bg-stone-950 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-70"
        >
          {isSubmitting ? "Processing..." : submitLabel}
        </button>
      </Form>

      <div className="mt-6 text-center text-sm text-stone-600">
        {alternatePrompt}{" "}
        <Link
          to={alternateHref}
          className="font-medium text-stone-950 hover:underline"
        >
          {alternateLabel}
        </Link>
      </div>
    </div>
  );
}
