import type { CreateProjectInput } from "./projects.server";
import type { ProjectWithAuthor } from "./projects";

export type ProjectFormValues = {
  title: string;
  summary: string;
  techTags: string;
  demoUrl: string;
  repoUrl: string;
  imageUrl: string;
};

export type ProjectFormErrors = Partial<
  Record<keyof ProjectFormValues | "form", string>
>;

export type ProjectFormActionData = {
  defaultValues: ProjectFormValues;
  errors: ProjectFormErrors;
};

export function getEmptyProjectFormValues(): ProjectFormValues {
  return {
    title: "",
    summary: "",
    techTags: "",
    demoUrl: "",
    repoUrl: "",
    imageUrl: "",
  };
}

export function getProjectFormValues(project: ProjectWithAuthor): ProjectFormValues {
  return {
    title: project.title,
    summary: project.summary,
    techTags: project.techTags.join(", "),
    demoUrl: project.demoUrl === "#" ? "" : project.demoUrl,
    repoUrl: project.repoUrl === "#" ? "" : project.repoUrl,
    imageUrl: project.imageUrl,
  };
}

export function readProjectFormValues(formData: FormData): ProjectFormValues {
  return {
    title: readFormValue(formData.get("title")),
    summary: readFormValue(formData.get("summary")),
    techTags: readFormValue(formData.get("techTags")),
    demoUrl: readFormValue(formData.get("demoUrl")),
    repoUrl: readFormValue(formData.get("repoUrl")),
    imageUrl: readFormValue(formData.get("imageUrl")),
  };
}

export function validateProjectForm(values: ProjectFormValues): ProjectFormErrors {
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

export function hasProjectFormErrors(errors: ProjectFormErrors) {
  return Object.keys(errors).length > 0;
}

export function parseTechTags(value: string) {
  return value
    .split(/,|\n/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function buildProjectInput(values: ProjectFormValues): CreateProjectInput {
  return {
    title: values.title,
    summary: values.summary,
    techTags: parseTechTags(values.techTags),
    ...(values.demoUrl ? { demoUrl: values.demoUrl } : {}),
    ...(values.repoUrl ? { repoUrl: values.repoUrl } : {}),
    ...(values.imageUrl ? { imageUrl: values.imageUrl } : {}),
  };
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
