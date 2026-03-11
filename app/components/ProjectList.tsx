import { ProjectCard } from "~/components/ProjectCard";
import type { DemoProjectWithAuthor } from "~/data/fakeData";

type ProjectListProps = {
  projects: DemoProjectWithAuthor[];
  viewMode: "gallery" | "list";
};

export function ProjectList({ projects, viewMode }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <p
        className={`rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-stone-600 ${
          viewMode === "gallery" ? "md:col-span-2" : ""
        }`}
      >
        No projects match your search.
      </p>
    );
  }

  return (
    <>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} viewMode={viewMode} />
      ))}
    </>
  );
}
