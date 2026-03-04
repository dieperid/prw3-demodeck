import { demoAuthors, demoProjects, type DemoProject, type DemoProjectWithAuthor } from "./fakeData";

export function getAllAuthors() {
  return demoAuthors;
}

export function getAuthorById(authorId: string | undefined) {
  return demoAuthors.find((author) => author.id === authorId) ?? null;
}

export function getProjectsByAuthorId(authorId: string | undefined) {
  return demoProjects
    .filter((project) => project.authorId === authorId)
    .map((project) => withAuthor(project))
    .filter((project): project is DemoProjectWithAuthor => project !== null);
}

export function getProjectById(projectId: string | undefined) {
  const project = demoProjects.find((item) => item.id === projectId);

  if (!project) {
    return null;
  }

  return withAuthor(project);
}

export function getAllProjects() {
  return demoProjects
    .map((project) => withAuthor(project))
    .filter((project): project is DemoProjectWithAuthor => project !== null);
}

function withAuthor(project: DemoProject) {
  const author = getAuthorById(project.authorId);

  if (!author) {
    return null;
  }

  return { ...project, author };
}
