import { useEffect } from "react";
import {
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/editProject";
import { ProjectEditorForm } from "~/components/ProjectEditorForm";
import { useToast } from "~/components/ToastProvider";
import { getAuthSession } from "~/lib/auth.server";
import {
  getProjectById,
  ProjectRequestError,
  updateProject,
} from "~/lib/projects.server";
import { createToastCookie } from "~/lib/session.server";
import {
  buildProjectInput,
  getProjectFormValues,
  hasProjectFormErrors,
  readProjectFormValues,
  type ProjectFormActionData,
  validateProjectForm,
} from "~/lib/project-form";

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
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, {
      headers: {
        "Set-Cookie": await createToastCookie(request, {
          message: "Please log in to edit this project.",
          type: "error",
        }),
      },
    });
  }

  const formData = await request.formData();
  const defaultValues = readProjectFormValues(formData);
  const errors = validateProjectForm(defaultValues);

  if (hasProjectFormErrors(errors)) {
    return data<ProjectFormActionData>({ defaultValues, errors }, { status: 400 });
  }

  try {
    const projectId = await updateProject(params.id, buildProjectInput(defaultValues), authSession.token);

    return redirect(`/projects/${projectId}`, {
      headers: {
        "Set-Cookie": await createToastCookie(request, {
          message: "Project updated successfully.",
          type: "success",
        }),
      },
    });
  } catch (error) {
    return data<ProjectFormActionData>(
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
  const actionData = useActionData<ProjectFormActionData>();
  const navigation = useNavigation();
  const { pushToast } = useToast();
  const isSubmitting = navigation.state === "submitting";
  const defaultValues =
    actionData?.defaultValues ?? getProjectFormValues(project);

  useEffect(() => {
    if (!actionData?.errors?.form) {
      return;
    }

    pushToast({
      message: actionData.errors.form,
      type: "error",
    });
  }, [actionData, pushToast]);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
          Edit {project.title}
        </h1>
      </header>

      <ProjectEditorForm
        action={`/projects/${project.id}/edit`}
        cancelHref={`/projects/${project.id}`}
        cancelLabel="Back to project details"
        defaultValues={defaultValues}
        errors={actionData?.errors}
        isSubmitting={isSubmitting}
        submitLabel="Save changes"
        submittingLabel="Saving..."
      />
    </section>
  );
}
