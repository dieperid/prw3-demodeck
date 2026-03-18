import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/projectDetail";
import { InfoBlock } from "~/components/InfoBlock";
import { ProjectOwnerActions } from "~/components/ProjectOwnerActions";
import { getAuthSession } from "~/lib/auth.server";
import {
  createProjectComment,
  deleteProject,
  getProjectById,
  likeProject,
  ProjectRequestError,
} from "~/lib/projects.server";

type CommentFormValues = {
  authorName: string;
  text: string;
};

type ActionData = {
  errors: Partial<Record<keyof CommentFormValues | "form", string>>;
  commentValues: CommentFormValues;
  createdComment?: Awaited<ReturnType<typeof createProjectComment>>;
};

function getEmptyCommentValues(): CommentFormValues {
  return {
    authorName: "",
    text: "",
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data?.project
        ? `${data.project.title} | DemoDeck`
        : "Project | DemoDeck",
    },
    {
      name: "description",
      content:
        "Project detail page, with project information and author information.",
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProjectById(params.id);

  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }

  return { project };
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("_intent");
  const redirectTo = new URL(request.url).pathname;

  if (intent !== "delete" && intent !== "like" && intent !== "comment") {
    return data<ActionData>(
      {
        commentValues: getEmptyCommentValues(),
        errors: { form: "Unsupported project action." },
      },
      { status: 405 },
    );
  }

  if (intent === "comment") {
    const commentValues = {
      authorName: String(formData.get("authorName") ?? "").trim(),
      text: String(formData.get("text") ?? "").trim(),
    };
    const errors: ActionData["errors"] = {};

    if (!commentValues.text) {
      errors.text = "Comment text is required.";
    }

    const authSession = await getAuthSession(request).catch(() => null);

    if (!authSession && !commentValues.authorName) {
      errors.authorName = "Your name is required for a public comment.";
    }

    if (Object.keys(errors).length > 0) {
      return data<ActionData>(
        { commentValues, errors },
        { status: 400 },
      );
    }

    try {
      const createdComment = await createProjectComment(
        params.id,
        authSession
          ? { text: commentValues.text }
          : {
              authorName: commentValues.authorName,
              text: commentValues.text,
            },
        authSession?.token,
      );
      return data<ActionData>({
        commentValues: getEmptyCommentValues(),
        createdComment: createdComment ?? undefined,
        errors: {},
      });
    } catch (error) {
      return data<ActionData>(
        {
          commentValues,
          errors: {
            form:
              error instanceof ProjectRequestError
                ? error.message
                : "An unexpected error occurred while processing the project action.",
          },
        },
        {
          status: error instanceof ProjectRequestError ? error.status : 500,
        },
      );
    }
  }

  const authSession = await getAuthSession(request);

  if (!authSession) {
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  try {
    if (intent === "delete") {
      await deleteProject(params.id, authSession.token);
      return redirect("/");
    }

    await likeProject(params.id, authSession.token);
    return redirect(redirectTo);
  } catch (error) {
    return data<ActionData>(
      {
        commentValues: getEmptyCommentValues(),
        errors: {
          form:
            error instanceof ProjectRequestError
              ? error.message
              : "An unexpected error occurred while processing the project action.",
        },
      },
      {
        status: error instanceof ProjectRequestError ? error.status : 500,
      },
    );
  }
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const rootData = useRouteLoaderData<typeof import("~/root").loader>("root");
  const isAuthenticated = rootData?.isAuthenticated ?? false;
  const commentValues = actionData?.commentValues ?? getEmptyCommentValues();
  const commentFormKey = `${commentValues.authorName}:${commentValues.text}`;
  const comments =
    actionData?.createdComment &&
    !project.comments.some((comment) => comment.id === actionData.createdComment?.id)
      ? [actionData.createdComment, ...project.comments]
      : project.comments;
  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("_intent") === "delete";
  const isSubmittingComment =
    navigation.state === "submitting" &&
    navigation.formData?.get("_intent") === "comment";
  const isOwner = rootData?.user?.id === project.author.id;

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <Link
          className="text-sm font-medium text-stone-600 hover:text-stone-950"
          to="/"
        >
          Back to gallery
        </Link>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
            {project.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            {project.summary}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock label="Author" value={project.author.name} />
              <InfoBlock label="Published" value={project.createdAt} />
              <InfoBlock label="Likes" value={`${project.likes}`} />
              <InfoBlock label="Image URL" value={project.imageUrl} />
            </div>

            <div>
              <p className="text-sm font-medium text-stone-700">Tech tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.techTags.map((tag) => (
                  <span
                    className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                href={project.demoUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open demo
              </a>
              <a
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                href={project.repoUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open GitHub
              </a>
              {isAuthenticated ? (
                <Form action={`/projects/${project.id}`} method="post">
                  <input name="_intent" type="hidden" value="like" />
                  <button
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                    type="submit"
                  >
                    Like project
                  </button>
                </Form>
              ) : (
                <Link
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                  to={`/login?redirectTo=${encodeURIComponent(`/projects/${project.id}`)}`}
                >
                  Log in to like
                </Link>
              )}
              {isOwner && (
                <ProjectOwnerActions
                  isDeleting={isDeleting}
                  projectId={project.id}
                />
              )}
            </div>
            {actionData?.errors?.form && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {actionData.errors.form}
              </div>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
              {project.author.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {project.author.bio}
            </p>
            <Link
              className="mt-5 inline-flex text-sm font-medium text-stone-950 hover:underline"
              to={`/authors/${project.author.id}`}
            >
              Open author profile
            </Link>
          </div>
        </aside>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
              Comments
            </h2>
            <span className="text-sm text-stone-500">
              {comments.length} total
            </span>
          </div>

          {comments.length > 0 ? (
            <div className="mt-6 space-y-4">
              {comments.map((comment) => (
                <article
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  key={comment.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-stone-950">
                      {comment.authorName}
                    </p>
                    <p className="text-sm text-stone-500">
                      {comment.createdAt}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-700">
                    {comment.text}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-stone-600">
              No comments yet. Be the first to add one.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
            Leave a comment
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {isAuthenticated
              ? "Your comment will be posted with your account."
              : "Post publicly by adding your name, or log in to comment with your account."}
          </p>

          <Form
            action={`/projects/${project.id}`}
            className="mt-6 space-y-4"
            key={commentFormKey}
            method="post"
          >
            <input name="_intent" type="hidden" value="comment" />

            {!isAuthenticated && (
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-stone-700"
                  htmlFor="authorName"
                >
                  Your name
                </label>
                <input
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
                  defaultValue={commentValues.authorName}
                  id="authorName"
                  name="authorName"
                  type="text"
                />
                {actionData?.errors.authorName && (
                  <p className="text-sm text-red-600">
                    {actionData.errors.authorName}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-700"
                htmlFor="text"
              >
                Comment
              </label>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
                defaultValue={commentValues.text}
                id="text"
                name="text"
              />
              {actionData?.errors.text && (
                <p className="text-sm text-red-600">{actionData.errors.text}</p>
              )}
            </div>

            <button
              className="rounded-full bg-stone-950 px-5 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-70"
              disabled={isSubmittingComment}
              type="submit"
            >
              Post comment
            </button>
          </Form>
        </div>
      </section>
    </section>
  );
}
