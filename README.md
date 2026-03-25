# PRW3 DemoDeck

DemoDeck is a full-stack React application for showcasing and exploring developer projects. Users can browse a gallery of projects, filter and sort results, open author profiles, register or log in, and publish or manage their own projects.

The frontend is built with **React 19**, **React Router 7**, **Redux Toolkit**, and **Tailwind CSS v4**. It communicates with a separate backend API documented in [docs/Backend.md](docs/Backend.md).

## Features

- Browse a gallery of developer projects
- Search, sort, and filter projects by technical tags
- View author profiles and project details
- Register, log in, and log out
- Create, edit, and delete projects as an authenticated user
- Like projects and post comments
- Display global success and error toasts for user actions

## Tech Stack

- React 19
- React Router 7 with SSR
- Redux Toolkit
- Tailwind CSS v4
- Vite
- Cookie-based session handling
- External Express + MariaDB / MySQL backend

## Prerequisites

To run this project locally, make sure you have:

- Node.js
- npm
- Docker (optional, for containerized runs)
- A running DemoDeck backend API

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dieperid/prw3-demodeck.git
cd prw3-demodeck
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Expected `.env` content:

```env
BACKEND_API_URL=http://localhost:3000
SESSION_SECRET=your_super_secret_session_key
```

- `BACKEND_API_URL`: Base URL of the backend service. Do not append `/api`, because the frontend already calls `/api/...`.
- `SESSION_SECRET`: Secret used to sign the session cookie.

### 4. Start the backend

The frontend expects the backend API to be available separately. See [docs/Backend.md](docs/Backend.md) for backend setup, database initialization, seed data, and manual verification commands.

### 5. Start the frontend

```bash
npm run dev
```

The development server is pinned to:

```text
http://localhost:5173
```

Use this exact URL during development to avoid host/origin mismatch issues with forwarded React Router actions.

## Available Scripts

- `npm run dev`: start the Vite / React Router development server
- `npm run build`: build the application for production
- `npm run start`: serve the production build
- `npm run typecheck`: generate route types and run TypeScript checks

## Production Build

The project includes a multi-stage `Dockerfile` for production-oriented builds.

### Build the image

```bash
docker build -t demodeck:latest .
```

### Run the container

```bash
docker run -p 3000:3000 --env-file .env demodeck:latest
```

The app will then be available at:

```text
http://localhost:3000
```

## Application Structure

The frontend source code lives in `app/`:

```text
app/
├── components/      # Reusable UI components
├── config/          # Store setup, typed hooks, server env access
├── helpers/         # Validation and small supporting helpers
├── lib/             # Server/client infrastructure and API integration
├── routes/          # React Router route modules
└── state/           # Redux slices and auth types
```

### Main responsibilities by folder

- `app/routes/`: page-level route modules with loaders and actions
- `app/lib/`: auth, session, backend fetch helpers, project data helpers, toast helpers
- `app/components/`: shared UI such as forms, cards, filters, navbar, and toast provider
- `app/state/`: Redux auth slice used to reflect authenticated user state in the UI
- `app/config/`: store, hooks, and environment configuration

## Routing Overview

The route tree is defined in `app/routes.ts` and includes:

- `/`: home page and project gallery
- `/login`: user login
- `/register`: user registration
- `/authors`: authors list
- `/authors/:id`: author detail
- `/projects/:id`: project detail
- `/projects/new`: protected project creation route
- `/projects/:id/edit`: protected project edition route
- `*`: not found page

Protected routes are wrapped by `app/routes/middleware.tsx`, which redirects unauthenticated users to the login page.

## Architecture Documentation

Additional documentation is available in:

- [docs/architecture-diagram.md](docs/architecture-diagram.md): detailed Mermaid architecture diagrams
- [docs/Backend.md](docs/Backend.md): backend API setup and usage

## Conventions

This project follows:

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Conventional Branch Naming](https://conventional-branch.github.io/)

## Collaboration

This project uses GitHub collaboration tooling:

- Issues
- Pull Requests
- GitHub Projects
