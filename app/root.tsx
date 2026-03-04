import {
  Form,
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import { Provider } from "react-redux";

import type { Route } from "./+types/root";
import "./app.css";
import { destroyAuthCookie, isAuthenticated } from "~/lib/auth.server";
import { store } from "./config/store";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  return { isAuthenticated: isAuthenticated(request) };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  if (formData.get("_intent") === "logout") {
    return redirect("/", {
      headers: { "Set-Cookie": destroyAuthCookie() },
    });
  }

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>{children}</Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <NavLink
              className="text-lg font-semibold tracking-tight text-stone-950"
              to="/"
            >
              DemoDeck
            </NavLink>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/authors">Authors</NavItem>
            {isAuthenticated ? (
              <NavItem to="/projects/new">New project</NavItem>
            ) : null}
            {!isAuthenticated ? <NavItem to="/login">Login</NavItem> : null}
            {!isAuthenticated ? (
              <NavItem to="/register">Register</NavItem>
            ) : null}
            {isAuthenticated ? (
              <Form action="/" method="post">
                <button
                  className="rounded-full border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                  name="_intent"
                  type="submit"
                  value="logout"
                >
                  Logout
                </button>
              </Form>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
          {message}
        </h1>
        <p className="mt-3 text-base text-stone-600">{details}</p>
      </div>
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto rounded-2xl bg-stone-950 p-4 text-sm text-stone-100">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2 font-medium transition",
          isActive
            ? "bg-stone-950 text-white"
            : "border border-stone-300 text-stone-700 hover:border-stone-950 hover:text-stone-950",
        ].join(" ")
      }
      to={to}
    >
      {children}
    </NavLink>
  );
}
