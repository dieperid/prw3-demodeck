import { Link } from "react-router";

import type { DemoProjectWithAuthor } from "~/data/fakeData";

type ProjectCardProps = {
  project: DemoProjectWithAuthor;
  viewMode?: "gallery" | "list";
};

export function ProjectCard({
  project,
  viewMode = "gallery",
}: ProjectCardProps) {
  if (viewMode === "list") {
    return (
      <article className="rounded-3xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_140px_120px] md:items-center">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 md:hidden">
              Title
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              <Link className="hover:underline" to={`/projects/${project.id}`}>
                {project.title}
              </Link>
            </h2>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 md:hidden">
              Author
            </p>
            <Link
              className="text-stone-700 hover:text-stone-950 hover:underline"
              to={`/authors/${project.author.id}`}
            >
              {project.author.name}
            </Link>
          </div>

          <div className="space-y-1 text-stone-600">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 md:hidden">
              Date
            </p>
            <span>{project.createdAt}</span>
          </div>

          <div className="space-y-1 text-stone-600">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 md:hidden">
              Likes
            </p>
            <span>{project.likes}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-stone-500">{project.createdAt}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
            <Link className="hover:underline" to={`/projects/${project.id}`}>
              {project.title}
            </Link>
          </h2>
        </div>
        <span className="rounded-full bg-stone-950 px-3 py-1 text-sm font-medium text-white">
          {project.likes} likes
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600">{project.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.techTags.map((tag) => (
          <span
            className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <Link
          className="font-medium text-stone-950 hover:underline"
          to={`/authors/${project.author.id}`}
        >
          by {project.author.name}
        </Link>
        <a
          className="text-stone-600 hover:text-stone-950 hover:underline"
          href={project.demoUrl}
          rel="noreferrer"
          target="_blank"
        >
          Demo
        </a>
        <a
          className="text-stone-600 hover:text-stone-950 hover:underline"
          href={project.repoUrl}
          rel="noreferrer"
          target="_blank"
        >
          GitHub
        </a>
      </div>
    </article>
  );
}
