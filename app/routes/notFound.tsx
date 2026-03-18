import { Link } from "react-router";

import type { Route } from "./+types/notFound";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "404 | DemoDeck" },
    {
      name: "description",
      content: "Page 404 for unknown URL.",
    },
  ];
}

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-10 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950">
        Cette URL n'existe pas
      </h1>
      <Link
        className="mt-8 inline-flex rounded-full bg-stone-950 px-5 py-3 font-medium text-white"
        to="/"
      >
        Retour à l'accueil
      </Link>
    </section>
  );
}
