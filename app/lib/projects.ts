export type ProjectAuthor = {
  id: string;
  username: string;
  name: string;
  bio: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  techTags: string[];
  demoUrl: string;
  repoUrl: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
};

export type ProjectWithAuthor = Project & {
  author: ProjectAuthor;
};
