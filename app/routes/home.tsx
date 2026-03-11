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
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
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
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
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
          </div>

          <div className="inline-flex self-start rounded-2xl border border-stone-300 bg-white p-1 shadow-sm items-center">
            <button
              aria-label="Gallery view"
              className={`rounded-xl p-2 transition ${
                viewMode === "gallery"
                  ? "bg-stone-950 text-white"
                  : "text-stone-600 hover:text-stone-950"
              }`}
              onClick={() => setViewMode("gallery")}
              title="Gallery view"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <rect height="7" rx="1.5" width="7" x="3" y="3" />
                <rect height="7" rx="1.5" width="7" x="14" y="3" />
                <rect height="7" rx="1.5" width="7" x="3" y="14" />
                <rect height="7" rx="1.5" width="7" x="14" y="14" />
              </svg>
            </button>
            <button
              aria-label="List view"
              className={`rounded-xl p-2 transition ${
                viewMode === "list"
                  ? "bg-stone-950 text-white"
                  : "text-stone-600 hover:text-stone-950"
              }`}
              onClick={() => setViewMode("list")}
              title="List view"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <line x1="8" x2="21" y1="6" y2="6" />
                <line x1="8" x2="21" y1="12" y2="12" />
                <line x1="8" x2="21" y1="18" y2="18" />
                <circle cx="4.5" cy="6" r="1.5" />
                <circle cx="4.5" cy="12" r="1.5" />
                <circle cx="4.5" cy="18" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section
        className={
          viewMode === "gallery" ? "grid gap-4 md:grid-cols-2" : "space-y-4"
        }
      >
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
            />
          ))
        ) : (
          <p
            className={`rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-stone-600 ${
              viewMode === "gallery" ? "md:col-span-2" : ""
            }`}
          >
            No projects match your search.
          </p>
        )}
      </section>
    </section>
  );
}
