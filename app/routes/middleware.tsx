import { Outlet, redirect } from "react-router";

import type { Route } from "./+types/middleware";
import { isAuthenticated } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  if (await isAuthenticated(request)) {
    return null;
  }

  const url = new URL(request.url);
  const redirectTo = `${url.pathname}${url.search}`;

  throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
}

export default function ProtectedLayout() {
  return <Outlet />;
}
