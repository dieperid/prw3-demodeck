import type { Route } from "./+types/home";
import { useState } from "react";
import { ProjectList } from "~/components/ProjectList";
import { SearchInput } from "~/components/SearchInput";
import { SortSelect } from "~/components/SortSelect";
import { TagFilters } from "~/components/TagFilters";
import { ViewModeToggle } from "~/components/ViewModeToggle";
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
        <SearchInput onChange={setSearchQuery} value={searchQuery} />
        <SortSelect onChange={setSortBy} value={sortBy} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <TagFilters tags={featuredTags} />
          <ViewModeToggle onChange={setViewMode} value={viewMode} />
        </div>
      </section>

      <section
        className={
          viewMode === "gallery" ? "grid gap-4 md:grid-cols-2" : "space-y-4"
        }
      >
        <ProjectList projects={projects} viewMode={viewMode} />
      </section>
    </section>
  );
}
