import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("projects/:id", "routes/projects/projectDetail.tsx"),
  //route("authors", "routes/authors/authorsList.tsx"),
  //route("authors/:id", "routes/authors/authorDetail.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),
  //layout("routes/middleware.tsx", [
    //route("projects/new", "routes/projects/newProject.tsx"),
    //route("projects/:id/edit", "routes/projects/editProject.tsx"),
    //]),
  //route("*", "routes/notFound.tsx"),
] satisfies RouteConfig;
