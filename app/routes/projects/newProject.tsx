import { useEffect } from "react";
import {
  data,
  redirect,
  useActionData,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/newProject";
import { ProjectEditorForm } from "~/components/ProjectEditorForm";
import { useToast } from "~/components/ToastProvider";
import { getAuthSession } from "~/lib/auth.server";
import { createProject, ProjectRequestError } from "~/lib/projects.server";
import { createToastCookie } from "~/lib/session.server";
import {
  buildProjectInput,
  getEmptyProjectFormValues,
  hasProjectFormErrors,
  readProjectFormValues,
  type ProjectFormActionData,
  validateProjectForm,
} from "~/lib/project-form";

export function meta(_args: Route.MetaArgs) {
  return [
    { title: "New project | DemoDeck" },
    {
      name: "description",
      content: "Publish a new project, with title, summary, tags and links.",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const authSession = await getAuthSession(request);

  if (!authSession) {
    throw redirect("/login?redirectTo=%2Fprojects%2Fnew", {
      headers: {
        "Set-Cookie": await createToastCookie(request, {
          message: "Please log in to publish a project.",
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
    const project = await createProject(buildProjectInput(defaultValues), authSession.token);

    return redirect(`/projects/${project.id}`, {
      headers: {
        "Set-Cookie": await createToastCookie(request, {
          message: "Project published successfully.",
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
              : "An unexpected error occurred while publishing the project.",
        },
      },
      {
        status: error instanceof ProjectRequestError ? error.status : 500,
      },
    );
  }
}

export default function NewProject() {
  const actionData = useActionData<ProjectFormActionData>();
  const navigation = useNavigation();
  const { pushToast } = useToast();
  const isSubmitting = navigation.state === "submitting";
  const defaultValues =
    actionData?.defaultValues ?? getEmptyProjectFormValues();

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
          Publish a new project
        </h1>
      </header>

      <ProjectEditorForm
        cancelHref="/"
        cancelLabel="Back to gallery"
        defaultValues={defaultValues}
        errors={actionData?.errors}
        isSubmitting={isSubmitting}
        submitLabel="Publish project"
        submittingLabel="Publishing..."
      />
    </section>
  );
}
