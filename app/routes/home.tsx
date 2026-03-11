import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { useState } from "react";
import { ProjectList } from "~/components/ProjectList";
import { SearchInput } from "~/components/SearchInput";
import { SortSelect } from "~/components/SortSelect";
import { TagFilters } from "~/components/TagFilters";
import { ViewModeToggle } from "~/components/ViewModeToggle";
import { getAllProjects } from "~/lib/projects.server";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "Home | DemoDeck" },
    {
      name: "description",
      content: "Projects gallery, with filter and search.",
    },
  ];
}

export async function loader() {
  const projects = await getAllProjects();

  return {
    projects,
  };
}

export default function Home() {
  const { projects: allProjects } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "likes">("date");
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const projects = allProjects
    .filter((project) => {
      if (!normalizedQuery) {
        return selectedTags.length === 0
          ? true
          : selectedTags.some((tag) => project.techTags.includes(tag));
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

      const matchesSearch = searchableText.includes(normalizedQuery);
      const matchesTags =
        selectedTags.length === 0
          ? true
          : selectedTags.some((tag) => project.techTags.includes(tag));

      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sortBy === "likes") {
        return b.likes - a.likes;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const featuredTags = [...new Set(allProjects.flatMap((project) => project.techTags))];

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
          <TagFilters
            onToggleTag={(tag) =>
              setSelectedTags((currentTags) =>
                currentTags.includes(tag)
                  ? currentTags.filter((currentTag) => currentTag !== tag)
                  : [...currentTags, tag]
              )
            }
            selectedTags={selectedTags}
            tags={featuredTags}
          />
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
