import { fetchBackend, readJson, asRecord, readString } from "./backend.server";
import { getAllProjects } from "./projects.server"; // <-- Imported this
import type { ProjectWithAuthor } from "./projects";

export type Author = {
  id: string;
  username: string;
  name: string;
};

export type AuthorProfile = {
  author: Author;
  projects: ProjectWithAuthor[];
};

export async function getAuthorProfile(
  authorId: string,
): Promise<AuthorProfile | null> {
  let response: Response;

  try {
    response = await fetchBackend(`/api/users/${authorId}`);
  } catch {
    throw new Response("Unable to reach the backend users API.", {
      status: 502,
    });
  }

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Response("Unable to load author from the backend.", {
      status: 502,
    });
  }

  const payload = await readJson<unknown>(response);
  const record = asRecord(payload);

  if (!record) return null;

  const user = asRecord(record.user) ?? record;

  const id = user.id ? String(user.id) : null;
  const username = readString(user.username);

  const firstName = readString(user.firstName) ?? "";
  const lastName = readString(user.lastName) ?? "";
  let name = `${firstName} ${lastName}`.trim();
  if (!name) name = username ?? "Unknown User";

  if (!id || !username) return null;

  const author = { id, username, name };

  const rawProjects = Array.isArray(user.projects) ? user.projects : [];

  const projects: ProjectWithAuthor[] = rawProjects.map((rawProj) => {
    const p = asRecord(rawProj);

    return {
      id: p?.id ? String(p.id) : `temp-${Math.random()}`,
      title: readString(p?.title) ?? "Untitled Project",
      summary: readString(p?.summary) ?? "",
      techTags: Array.isArray(p?.techTags) ? (p.techTags as string[]) : [],
      demoUrl: readString(p?.demoUrl) ?? "",
      repoUrl: readString(p?.repoUrl) ?? "",
      imageUrl: readString(p?.imageUrl) ?? "",
      likes: Number(p?.likes) || 0,
      createdAt: readString(p?.createdAt) ?? new Date().toISOString(),
      author: author,
    };
  });

  return { author, projects };
}

export async function getAllAuthors(): Promise<
  (Author & { projectsCount: number })[]
> {
  const [usersResponse, allProjects] = await Promise.all([
    fetchBackend("/api/users").catch(() => null),
    getAllProjects().catch(() => []),
  ]);

  if (!usersResponse || !usersResponse.ok) {
    throw new Response("Unable to load authors from the backend.", {
      status: 502,
    });
  }

  const payload = await readJson<unknown>(usersResponse);

  let rawUsers: unknown[] = [];
  if (Array.isArray(payload)) {
    rawUsers = payload;
  } else {
    const record = asRecord(payload);
    if (record && Array.isArray(record.users)) {
      rawUsers = record.users;
    } else if (record && Array.isArray(record.data)) {
      rawUsers = record.data;
    }
  }

  const authors = rawUsers
    .map((rawUser) => {
      const user = asRecord(rawUser);
      if (!user) return null;

      const id = user.id ? String(user.id) : null;
      const username = readString(user.username);

      const firstName = readString(user.firstName) ?? "";
      const lastName = readString(user.lastName) ?? "";
      let name = `${firstName} ${lastName}`.trim();

      if (!name) name = username ?? "Unknown User";

      if (!id || !username) return null;

      const projectsCount = allProjects.filter(
        (project) => String(project?.author.id) === id,
      ).length;

      return {
        id,
        username,
        name,
        projectsCount,
      };
    })
    .filter((a): a is Author & { projectsCount: number } => a !== null);

  return authors;
}
