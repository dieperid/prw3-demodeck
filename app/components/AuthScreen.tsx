import { useEffect } from "react";
import {
  Form,
  Link,
  useFetcher,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";

import { useAppDispatch } from "~/config/hooks";
import {
  clearStoredAuthSession,
  saveAuthSession,
  type StoredAuthSession,
} from "~/lib/auth.client";
import { setCredentials, setLoading } from "~/state/auth/authSlice";

type AuthScreenProps = {
  title: string;
  submitLabel: string;
  alternateLabel: string;
  alternateHref: string;
  alternatePrompt: string;
  enableClientAuth?: boolean;
};

export function AuthScreen({
  title,
  submitLabel,
  alternateLabel,
  alternateHref,
  alternatePrompt,
  enableClientAuth = false,
}: AuthScreenProps) {
  const dispatch = useAppDispatch();
  const fetcher = useFetcher<{
    error?: string;
    redirectTo?: string;
    success?: boolean;
    token?: string;
    user?: StoredAuthSession["user"];
  }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const FormComponent = enableClientAuth ? fetcher.Form : Form;
  const isSubmitting = enableClientAuth
    ? fetcher.state !== "idle"
    : navigation.state === "submitting";
  const errorMessage = enableClientAuth ? fetcher.data?.error : null;

  useEffect(() => {
    if (!enableClientAuth) {
      return;
    }

    dispatch(setLoading(isSubmitting));
  }, [dispatch, enableClientAuth, isSubmitting]);

  useEffect(() => {
    if (!enableClientAuth || !fetcher.data?.success) {
      return;
    }

    if (!fetcher.data.token || !fetcher.data.user || !fetcher.data.redirectTo) {
      clearStoredAuthSession();
      return;
    }

    saveAuthSession({
      token: fetcher.data.token,
      user: fetcher.data.user,
    });
    dispatch(
      setCredentials({
        id: fetcher.data.user.id,
        name: fetcher.data.user.name,
        token: fetcher.data.token,
      }),
    );
    navigate(fetcher.data.redirectTo);
  }, [dispatch, enableClientAuth, fetcher.data, navigate]);

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-stone-200 bg-stone-950 p-8 text-stone-50 shadow-sm">
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <FormComponent className="space-y-5" method="post">
          <input name="redirectTo" type="hidden" value={redirectTo} />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
              defaultValue="student"
              name="identifier"
              type="text"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">Password</span>
            <input
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
              defaultValue="password"
              name="password"
              type="password"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="w-full rounded-2xl bg-stone-950 px-5 py-3 font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-500"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Processing..." : submitLabel}
          </button>
        </FormComponent>

        <p className="mt-6 text-sm text-stone-600">
          {alternatePrompt}{" "}
          <Link
            className="font-medium text-stone-950 underline underline-offset-4"
            to={alternateHref}
          >
            {alternateLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
