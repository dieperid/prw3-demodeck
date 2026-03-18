import {
  asRecord,
  fetchBackend,
  readJson,
  readNumber,
  readString,
  readStringArray,
} from "./backend.server";
import type { ProjectWithAuthor } from "./projects";

type BackendProject = Record<string, unknown>;

export type CreateProjectInput = {
  title: string;
  summary: string;
  techTags: string[];
  demoUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
};

export class ProjectRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ProjectRequestError";
    this.status = status;
  }
}

export async function getAllProjects() {
  let response: Response;

  try {
    response = await fetchBackend("/api/projects");
  } catch {
    throw new Response("Unable to reach the backend projects API.", {
      status: 502,
    });
  }

  if (!response.ok) {
    throw new Response("Unable to load projects from the backend.", {
      status: 502,
    });
  }

  const payload = await readJson<unknown>(response);

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((project) => normalizeProject(project))
    .filter((project): project is ProjectWithAuthor => project !== null);
}

export async function getProjectById(projectId: string | undefined) {
  if (!projectId) {
    return null;
  }

  const projects = await getAllProjects();
  return projects.find((project) => project.id === projectId) ?? null;
}

export async function createProject(
  project: CreateProjectInput,
  token: string,
) {
  let response: Response;

  try {
    response = await fetchBackend("/api/projects", {
      body: JSON.stringify(project),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the backend projects API.",
      502,
    );
  }

  if (!response.ok) {
    throw new ProjectRequestError(
      await readBackendError(response, "Unable to create the project."),
      response.status >= 400 ? response.status : 500,
    );
  }

  const payload = await readJson<unknown>(response);
  const createdProject = normalizeProject(payload);

  if (!createdProject) {
    throw new ProjectRequestError(
      "The backend response is missing project data.",
      502,
    );
  }

  return createdProject;
}

function normalizeProject(value: unknown) {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const id = readString(record.id) ?? readString(record.projectId);
  const title = readString(record.title) ?? readString(record.name);
  const summary =
    readString(record.summary) ??
    readString(record.description) ??
    readString(record.content) ??
    "";
  const techTags = readStringArray(
    record.techTags ?? record.tech_tags ?? record.tags,
  );
  const demoUrl =
    readString(record.demoUrl) ??
    readString(record.demo_url) ??
    readString(record.liveUrl) ??
    readString(record.live_url) ??
    "#";
  const repoUrl =
    readString(record.repoUrl) ??
    readString(record.repo_url) ??
    readString(record.githubUrl) ??
    readString(record.github_url) ??
    "#";
  const imageUrl =
    readString(record.imageUrl) ?? readString(record.image_url) ?? "";
  const likes =
    readNumber(record.likes) ??
    readNumber(record.likesCount) ??
    readNumber(record.likeCount) ??
    0;
  const createdAt = normalizeDate(
    readString(record.createdAt) ?? readString(record.created_at),
  );
  const author = normalizeAuthor(record);

  if (!id || !title || !author) {
    return null;
  }

  return {
    id,
    title,
    summary,
    techTags,
    demoUrl,
    repoUrl,
    imageUrl,
    likes,
    createdAt,
    author,
  } satisfies ProjectWithAuthor;
}

function normalizeAuthor(project: BackendProject) {
  const authorRecord =
    asRecord(project.author) ??
    asRecord(project.user) ??
    asRecord(project.owner) ??
    null;

  const id =
    readString(authorRecord?.id) ??
    readString(authorRecord?.userId) ??
    readString(project.authorId) ??
    readString(project.userId);

  if (!id) {
    return null;
  }

  const username =
    readString(authorRecord?.username) ??
    readString(authorRecord?.login) ??
    readString(project.authorUsername) ??
    `user-${id}`;
  const name =
    readString(authorRecord?.name) ??
    readString(authorRecord?.fullName) ??
    readString(project.authorName) ??
    username;
  const bio =
    readString(authorRecord?.bio) ?? readString(project.authorBio) ?? "";

  return {
    id,
    username,
    name,
    bio,
  };
}

function normalizeDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  return value.length >= 10 ? value.slice(0, 10) : value;
}

async function readBackendError(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const payload = await readJson<unknown>(response).catch(() => null);
  const record = asRecord(payload);

  return (
    readString(record?.message) ??
    readString(record?.error) ??
    fallbackMessage
  );
}
