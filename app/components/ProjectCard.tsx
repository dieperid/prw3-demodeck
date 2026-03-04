import { Link } from "react-router";

import type { DemoProjectWithAuthor } from "~/data/fakeData";

type ProjectCardProps = {
  project: DemoProjectWithAuthor;
};

export function ProjectCard({ project }: ProjectCardProps) {
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
