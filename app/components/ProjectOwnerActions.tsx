import { Form, Link } from "react-router";

type ProjectOwnerActionsProps = {
  isDeleting: boolean;
  projectId: string;
};

export function ProjectOwnerActions({
  isDeleting,
  projectId,
}: ProjectOwnerActionsProps) {
  return (
    <>
      <Link
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
        to={`/projects/${projectId}/edit`}
      >
        Edit project
      </Link>
      <Form
        action={`/projects/${projectId}`}
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
  );
}
