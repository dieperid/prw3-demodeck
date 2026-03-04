import type { Route } from "./+types/home";
import { ProjectCard } from "~/components/ProjectCard";
import { getAllProjects } from "~/data/fakeApiFetch";

const featuredTags = ["React", "TypeScript", "Node.js", "MySQL", "UI"];

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Home | DemoDeck" },
    {
      name: "description",
      content: "Projects gallery, with filter and search.",
    },
  ];
}

export default function Home() {
  const projects = getAllProjects();

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
            Projects gallery
          </h1>
        </div>
      </header>

      <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Search</span>
          <input
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
            placeholder="Title, tech, author..."
            type="search"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Sort</span>
          <select className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950">
            <option>Date</option>
            <option>Likes</option>
          </select>
        </label>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-stone-700">Tags filters</p>
        <div className="flex flex-wrap gap-2">
          {featuredTags.map((tag) => (
            <span
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>
    </section>
  );
}
