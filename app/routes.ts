import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("projects/:id", "routes/projects/project-detail.tsx"),
  route("authors", "routes/authors/authors-list.tsx"),
  route("authors/:id", "routes/authors/author-detail.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  layout("routes/middleware.tsx", [
    route("projects/new", "routes/projects/new-project.tsx"),
    route("projects/:id/edit", "routes/projects/edit-project.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
