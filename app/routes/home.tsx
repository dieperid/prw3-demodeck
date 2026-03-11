import type { Route } from "./+types/home";
import { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "likes">("date");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const projects = getAllProjects()
    .filter((project) => {
      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        project.title,
        project.summary,
        project.author.name,
        project.author.username,
        ...project.techTags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    })
    .sort((a, b) => {
    if (sortBy === "likes") {
      return b.likes - a.likes;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Title, tech, author..."
            type="search"
            value={searchQuery}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Sort</span>
          <select
            className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
            onChange={(event) =>
              setSortBy(event.target.value as "date" | "likes")
            }
            value={sortBy}
          >
            <option value="date">Date</option>
            <option value="likes">Likes</option>
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
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-stone-600 md:col-span-2">
            No projects match your search.
          </p>
        )}
      </section>
    </section>
  );
}
