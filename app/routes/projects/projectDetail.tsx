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
import { getAuthSession } from "~/lib/auth.server";
import {
  deleteProject,
  getProjectById,
  ProjectRequestError,
} from "~/lib/projects.server";

type ActionData = {
  errors: {
    form: string;
  };
};

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

  if (formData.get("_intent") !== "delete") {
    return data<ActionData>(
      { errors: { form: "Unsupported project action." } },
      { status: 405 },
    );
  }

  const authSession = await getAuthSession(request);

  if (!authSession) {
    const redirectTo = new URL(request.url).pathname;
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  try {
    await deleteProject(params.id, authSession.token);
    return redirect("/");
  } catch (error) {
    return data<ActionData>(
      {
        errors: {
          form:
            error instanceof ProjectRequestError
              ? error.message
              : "An unexpected error occurred while deleting the project.",
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
  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("_intent") === "delete";
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
              {isOwner && (
                <>
                  <Link
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                    to={`/projects/${project.id}/edit`}
                  >
                    Edit project
                  </Link>
                  <Form
                    action={`/projects/${project.id}`}
                    method="post"
                    onSubmit={(event) => {
                      const isConfirmed = window.confirm(
                        "Delete this project permanently?",
                      );

                      if (!isConfirmed) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input name="_intent" type="hidden" value="delete" />
                    <button
                      className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-70"
                      disabled={isDeleting}
                      type="submit"
                    >
                      {isDeleting ? "Deleting..." : "Delete project"}
                    </button>
                  </Form>
                </>
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
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-100 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 break-all text-sm text-stone-700">{value}</p>
    </div>
  );
}
