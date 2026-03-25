import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/authorDetail";
import { getAuthorProfile } from "~/lib/authors.server";
import { ProjectList } from "~/components/ProjectList";

export function meta({ data }: Route.MetaArgs) {
  const author = data?.profile?.author;

  return [
    {
      title: author ? `${author.name} | DemoDeck` : "Author Profile | DemoDeck",
    },
    {
      name: "description",
      content: author
        ? `View projects by ${author.name}`
        : "Author profile page.",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const profile = await getAuthorProfile(params.id);

  if (!profile) {
    throw new Response("Author not found", { status: 404 });
  }

  return { profile };
}

export default function AuthorDetail() {
  const { profile } = useLoaderData<typeof loader>();
  const { author, projects } = profile;

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
            {author.name}
          </h1>
          <p className="mt-2 text-lg font-medium text-stone-400">
            @{author.username}
          </p>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="pl-2 text-2xl font-semibold tracking-tight text-stone-950">
          Projects by {author.name}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ProjectList projects={projects} viewMode="gallery" />
        </div>
      </section>
    </section>
  );
}
