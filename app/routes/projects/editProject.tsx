import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/editProject";
import { getAuthSession } from "~/lib/auth.server";
import {
  getProjectById,
  ProjectRequestError,
  updateProject,
} from "~/lib/projects.server";
import type { ProjectWithAuthor } from "~/lib/projects";

type ProjectFormValues = {
  title: string;
  summary: string;
  techTags: string;
  demoUrl: string;
  repoUrl: string;
  imageUrl: string;
};

type ProjectFormErrors = Partial<
  Record<keyof ProjectFormValues | "form", string>
>;

type ActionData = {
  defaultValues: ProjectFormValues;
  errors: ProjectFormErrors;
};

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data?.project
        ? `Edit ${data.project.title} | DemoDeck`
        : "Edit project | DemoDeck",
    },
    {
      name: "description",
      content:
        "Project editing screen, with form to update title, summary, tags and links.",
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
  const authSession = await getAuthSession(request);

  if (!authSession) {
    const redirectTo = new URL(request.url).pathname;
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const formData = await request.formData();
  const defaultValues = readProjectFormValues(formData);
  const errors = validateProjectForm(defaultValues);

  if (hasErrors(errors)) {
    return data<ActionData>({ defaultValues, errors }, { status: 400 });
  }

  try {
    const projectId = await updateProject(
      params.id,
      {
        title: defaultValues.title,
        summary: defaultValues.summary,
        techTags: parseTechTags(defaultValues.techTags),
        ...(defaultValues.demoUrl ? { demoUrl: defaultValues.demoUrl } : {}),
        ...(defaultValues.repoUrl ? { repoUrl: defaultValues.repoUrl } : {}),
        ...(defaultValues.imageUrl ? { imageUrl: defaultValues.imageUrl } : {}),
      },
      authSession.token,
    );

    return redirect(`/projects/${projectId}`);
  } catch (error) {
    return data<ActionData>(
      {
        defaultValues,
        errors: {
          form:
            error instanceof ProjectRequestError
              ? error.message
              : "An unexpected error occurred while saving the project.",
        },
      },
      {
        status: error instanceof ProjectRequestError ? error.status : 500,
      },
    );
  }
}

export default function EditProject() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const defaultValues =
    actionData?.defaultValues ?? getProjectFormValues(project);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
          Edit {project.title}
        </h1>
      </header>

      <Form
        action={`/projects/${project.id}/edit`}
        className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"
        method="post"
      >
        {actionData?.errors?.form && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {actionData.errors.form}
          </div>
        )}

        <Field
          defaultValue={defaultValues.title}
          error={actionData?.errors?.title}
          label="Title"
          name="title"
          placeholder="My mini-project"
        />
        <Field
          defaultValue={defaultValues.summary}
          error={actionData?.errors?.summary}
          label="Summary"
          multiline
          name="summary"
          placeholder="Explain quickly the purpose of the project, the stack and the value."
        />
        <Field
          defaultValue={defaultValues.techTags}
          error={actionData?.errors?.techTags}
          helperText="Separate tags with commas."
          label="Technical Tags"
          name="techTags"
          placeholder="React, TypeScript, MySQL"
        />
        <Field
          defaultValue={defaultValues.demoUrl}
          error={actionData?.errors?.demoUrl}
          label="Demo URL"
          name="demoUrl"
          placeholder="https://demo.example.com"
        />
        <Field
          defaultValue={defaultValues.repoUrl}
          error={actionData?.errors?.repoUrl}
          label="GitHub URL"
          name="repoUrl"
          placeholder="https://github.com/me/project"
        />
        <Field
          defaultValue={defaultValues.imageUrl}
          error={actionData?.errors?.imageUrl}
          label="Image URL"
          name="imageUrl"
          placeholder="https://images.example.com/cover.jpg"
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            className="rounded-full bg-stone-950 px-5 py-3 font-medium text-white"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            className="rounded-full border border-stone-300 px-5 py-3 font-medium text-stone-700"
            to={`/projects/${project.id}`}
          >
            Back to project details
          </Link>
        </div>
      </Form>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
  error,
  helperText,
  multiline = false,
}: {
  label: string;
  name: keyof ProjectFormValues;
  placeholder: string;
  defaultValue?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>

      {multiline ? (
        <textarea
          className="min-h-32 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
        />
      ) : (
        <input
          className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-950"
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
          type="text"
        />
      )}

      {helperText && !error && (
        <p className="text-sm text-stone-500">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </label>
  );
}

function getProjectFormValues(project: ProjectWithAuthor): ProjectFormValues {
  return {
    title: project.title,
    summary: project.summary,
    techTags: project.techTags.join(", "),
    demoUrl: project.demoUrl === "#" ? "" : project.demoUrl,
    repoUrl: project.repoUrl === "#" ? "" : project.repoUrl,
    imageUrl: project.imageUrl,
  };
}

function readProjectFormValues(formData: FormData): ProjectFormValues {
  return {
    title: readFormValue(formData.get("title")),
    summary: readFormValue(formData.get("summary")),
    techTags: readFormValue(formData.get("techTags")),
    demoUrl: readFormValue(formData.get("demoUrl")),
    repoUrl: readFormValue(formData.get("repoUrl")),
    imageUrl: readFormValue(formData.get("imageUrl")),
  };
}

function validateProjectForm(values: ProjectFormValues): ProjectFormErrors {
  const errors: ProjectFormErrors = {};

  if (!values.title) {
    errors.title = "Title is required.";
  }

  if (!values.summary) {
    errors.summary = "Summary is required.";
  }

  if (parseTechTags(values.techTags).length === 0) {
    errors.techTags = "Add at least one technical tag.";
  }

  if (values.demoUrl && !isValidUrl(values.demoUrl)) {
    errors.demoUrl = "Enter a valid URL.";
  }

  if (values.repoUrl && !isValidUrl(values.repoUrl)) {
    errors.repoUrl = "Enter a valid URL.";
  }

  if (values.imageUrl && !isValidUrl(values.imageUrl)) {
    errors.imageUrl = "Enter a valid URL.";
  }

  return errors;
}

function hasErrors(errors: ProjectFormErrors) {
  return Object.keys(errors).length > 0;
}

function parseTechTags(value: string) {
  return value
    .split(/,|\n/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function readFormValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
