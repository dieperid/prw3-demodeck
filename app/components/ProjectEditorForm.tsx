import { Form, Link } from "react-router";

import type { ProjectFormErrors, ProjectFormValues } from "~/lib/project-form";

type ProjectEditorFormProps = {
  action?: string;
  cancelHref: string;
  cancelLabel: string;
  defaultValues: ProjectFormValues;
  errors?: ProjectFormErrors;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
};

export function ProjectEditorForm({
  action,
  cancelHref,
  cancelLabel,
  defaultValues,
  errors,
  isSubmitting,
  submitLabel,
  submittingLabel,
}: ProjectEditorFormProps) {
  return (
    <Form
      action={action}
      className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"
      method="post"
    >
      {errors?.form && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {errors.form}
        </div>
      )}

      <Field
        defaultValue={defaultValues.title}
        error={errors?.title}
        label="Title"
        name="title"
        placeholder="My mini-project"
      />
      <Field
        defaultValue={defaultValues.summary}
        error={errors?.summary}
        label="Summary"
        multiline
        name="summary"
        placeholder="Explain quickly the purpose of the project, the stack and the value."
      />
      <Field
        defaultValue={defaultValues.techTags}
        error={errors?.techTags}
        helperText="Separate tags with commas."
        label="Technical Tags"
        name="techTags"
        placeholder="React, TypeScript, MySQL"
      />
      <Field
        defaultValue={defaultValues.demoUrl}
        error={errors?.demoUrl}
        label="Demo URL"
        name="demoUrl"
        placeholder="https://demo.example.com"
      />
      <Field
        defaultValue={defaultValues.repoUrl}
        error={errors?.repoUrl}
        label="GitHub URL"
        name="repoUrl"
        placeholder="https://github.com/me/project"
      />
      <Field
        defaultValue={defaultValues.imageUrl}
        error={errors?.imageUrl}
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
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        <Link
          className="rounded-full border border-stone-300 px-5 py-3 font-medium text-stone-700"
          to={cancelHref}
        >
          {cancelLabel}
        </Link>
      </div>
    </Form>
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
