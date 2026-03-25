import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/authorsList";
import { getAllAuthors } from "~/lib/authors.server";

export function meta() {
  return [
    { title: "Authors | DemoDeck" },
    {
      name: "description",
      content: "Discover the talented creators building projects on DemoDeck.",
    },
  ];
}

export async function loader() {
  const authors = await getAllAuthors();
  return { authors };
}

export default function AuthorsList() {
  const { authors } = useLoaderData<typeof loader>();

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
          Liste des auteurs
        </h1>
      </header>

      {authors.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <p className="text-stone-500 text-lg">No authors found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {authors.map((author) => (
            <article
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col"
              key={author.id}
            >
              <p className="text-sm text-stone-500">@{author.username}</p>
              <h2 className="mt-2 mb-2 text-2xl font-semibold tracking-tight text-stone-950">
                {author.name}
              </h2>

              <div className="mt-auto flex items-center justify-between text-sm">
                <span className="text-stone-500">
                  {author.projectsCount} project(s)
                </span>
                <Link
                  className="font-medium text-stone-950 hover:underline"
                  to={`/authors/${author.id}`}
                >
                  Open profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
