export type DemoAuthor = {
  id: string;
  username: string;
  name: string;
  bio: string;
  techTags: string[];
};

export type DemoProject = {
  id: string;
  title: string;
  summary: string;
  techTags: string[];
  demoUrl: string;
  repoUrl: string;
  imageUrl: string;
  authorId: string;
  likes: number;
  createdAt: string;
};

export type DemoProjectWithAuthor = DemoProject & {
  author: DemoAuthor;
};

export const demoAuthors: DemoAuthor[] = [
  {
    id: "1",
    username: "lea",
    name: "Lea Martin",
    bio: "Frontend student focused on React and component architecture.",
    techTags: ["React", "TypeScript", "CSS"],
  },
  {
    id: "2",
    username: "sam",
    name: "Sam Bernard",
    bio: "Full-stack student building APIs, auth flows and dashboards.",
    techTags: ["Node.js", "Express", "MySQL"],
  },
  {
    id: "3",
    username: "nina",
    name: "Nina Dubois",
    bio: "Product-minded student interested in UX, routing and data flows.",
    techTags: ["UX", "React Router", "Testing"],
  },
];

export const demoProjects: DemoProject[] = [
  {
    id: "101",
    title: "Route planner",
    summary: "Visualise the main project screens and navigation in one place.",
    techTags: ["React", "TypeScript", "UI"],
    demoUrl: "https://example.com/demo/route-planner",
    repoUrl: "https://github.com/example/route-planner",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    authorId: "1",
    likes: 18,
    createdAt: "2026-03-01",
  },
  {
    id: "102",
    title: "Feedback board",
    summary: "Collect comments and likes around student mini-projects.",
    techTags: ["React", "Node.js", "MySQL"],
    demoUrl: "https://example.com/demo/feedback-board",
    repoUrl: "https://github.com/example/feedback-board",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    authorId: "2",
    likes: 26,
    createdAt: "2026-02-26",
  },
  {
    id: "103",
    title: "Author showcase",
    summary: "Highlight authors, their profile page and related project list.",
    techTags: ["React Router", "Testing", "UX"],
    demoUrl: "https://example.com/demo/author-showcase",
    repoUrl: "https://github.com/example/author-showcase",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    authorId: "3",
    likes: 12,
    createdAt: "2026-02-20",
  },
];