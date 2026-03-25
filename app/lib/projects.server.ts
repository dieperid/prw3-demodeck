import {
  asRecord,
  fetchBackend,
  readJson,
  readNumber,
  readString,
  readStringArray,
} from "./backend.server";
import type { ProjectComment, ProjectWithAuthor } from "./projects";

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

  try {
    const response = await fetchBackend(`/api/projects/${projectId}`);

    if (response.ok) {
      const payload = await readJson<unknown>(response);
      const project = normalizeProject(payload);

      if (project) {
        return project;
      }
    } else if (response.status === 404) {
      return null;
    }
  } catch {
    // Fall back to the projects list endpoint when the detail endpoint is unavailable.
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

export async function updateProject(
  projectId: string | undefined,
  project: CreateProjectInput,
  token: string,
) {
  if (!projectId) {
    throw new ProjectRequestError("Invalid project id.", 400);
  }

  let response: Response;

  try {
    response = await fetchBackend(`/api/projects/${projectId}`, {
      body: JSON.stringify(project),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the backend projects API.",
      502,
    );
  }

  if (!response.ok) {
    throw new ProjectRequestError(
      await readBackendError(response, "Unable to update the project."),
      response.status >= 400 ? response.status : 500,
    );
  }

  const payload = await readJson<unknown>(response).catch(() => null);
  const record = asRecord(payload);

  return (
    readString(record?.id) ?? readString(record?.projectId) ?? projectId
  );
}

export async function deleteProject(
  projectId: string | undefined,
  token: string,
) {
  if (!projectId) {
    throw new ProjectRequestError("Invalid project id.", 400);
  }

  let response: Response;

  try {
    response = await fetchBackend(`/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "DELETE",
    });
  } catch {
    throw new ProjectRequestError(
      "Unable to reach the backend projects API.",
      502,
    );
  }

  if (!response.ok) {
    throw new ProjectRequestError(
      await readBackendError(response, "Unable to delete the project."),
      response.status >= 400 ? response.status : 500,
    );
  }
}

export async function likeProject(
  projectId: string | undefined,
  token: string,
) {
  if (!projectId) {
    throw new ProjectRequestError("Invalid project id.", 400);
  }

  let response: Response;

  try {
    response = await fetchBackend(`/api/projects/${projectId}/like`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
      await readBackendError(response, "Unable to like the project."),
      response.status >= 400 ? response.status : 500,
    );
  }

  const payload = await readJson<unknown>(response).catch(() => null);
  const record = asRecord(payload);

  return (
    readNumber(record?.likes) ??
    readNumber(record?.likesCount) ??
    readNumber(record?.likeCount) ??
    null
  );
}

export type CreateProjectCommentInput = {
  text: string;
  authorName?: string;
};

export async function createProjectComment(
  projectId: string | undefined,
  comment: CreateProjectCommentInput,
  token?: string,
) {
  if (!projectId) {
    throw new ProjectRequestError("Invalid project id.", 400);
  }

  let response: Response;

  try {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    response = await fetchBackend(`/api/projects/${projectId}/comments`, {
      body: JSON.stringify(comment),
      headers,
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
      await readBackendError(response, "Unable to add the comment."),
      response.status >= 400 ? response.status : 500,
    );
  }

  const payload = await readJson<unknown>(response).catch(() => null);

  return normalizeComment(payload);
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
  const comments = normalizeComments(record.comments ?? record.projectComments);

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
    comments,
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
    readString(authorRecord?.bio) ??
    readString(project.authorBio) ??
    "No bio available.";

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

function normalizeComments(value: unknown): ProjectComment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((comment) => normalizeComment(comment))
    .filter((comment): comment is ProjectComment => comment !== null);
}

function normalizeComment(value: unknown): ProjectComment | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const userRecord =
    asRecord(record.user) ??
    asRecord(record.author) ??
    asRecord(record.owner) ??
    null;
  const id = readString(record.id) ?? readString(record.commentId);
  const text =
    readString(record.text) ??
    readString(record.content) ??
    readString(record.body);
  const authorName =
    readString(record.authorName) ??
    readString(record.name) ??
    readString(userRecord?.name) ??
    readString(userRecord?.username) ??
    readString(record.username) ??
    "Anonymous";
  const createdAt = normalizeDate(
    readString(record.createdAt) ?? readString(record.created_at),
  );

  if (!id || !text) {
    return null;
  }

  return {
    id,
    text,
    authorName,
    createdAt,
  };
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
