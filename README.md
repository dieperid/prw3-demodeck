# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Authentication

The frontend is now connected to the backend API described in `backend-readme.md`.

### Backend URL

By default, the frontend calls:

```txt
http://localhost:3000
```

The value is read in `app/lib/backend.server.ts`.

### Demo credentials

After seeding the backend, you can log in with:

```txt
username: alice
password: demo-alice
```

Other seeded accounts from the backend README also work.

### Files involved

- `app/lib/backend.server.ts`
- `app/lib/auth.server.ts`
- `app/lib/auth.client.ts`
- `app/routes/auth/login.tsx`
- `app/components/AuthScreen.tsx`
- `app/state/auth/authSlice.ts`
- `app/root.tsx`

### Current auth flow

1. The login form posts to the route action in `app/routes/auth/login.tsx`.
2. The action calls `authenticateUser(...)` from `app/lib/auth.server.ts`.
3. `authenticateUser(...)` sends `POST /api/login` to the backend with:

```json
{
  "username": "alice",
  "password": "demo-alice"
}
```

4. The frontend accepts the backend login response in this shape:

```json
{
  "token": "jwt-token-here",
  "expiresIn": "1h",
  "user": {
    "id": 1,
    "username": "alice",
    "name": "Alice"
  }
}
```

5. If needed, the frontend also resolves the current user via `GET /api/me`, which is accepted in this shape:

```json
{
  "user": {
    "id": 1,
    "username": "alice",
    "name": "Alice"
  }
}
```

6. On success, the frontend:
   - sets an `HttpOnly` session cookie for SSR route checks
   - stores `{ token, user }` in `localStorage`
   - updates Redux auth state

7. On reload, `app/root.tsx` restores auth state from `localStorage` only if the stored session matches the expected runtime shape. Invalid or stale entries are removed automatically.

### Stored session shape

The client stores this payload under `demodeck_auth_session`:

```ts
type StoredAuthSession = {
  token: string;
  user: {
    id: string;
    name: string;
  };
};
```

### Notes

- `isAuthenticated(request)` checks the session cookie and validates it against `GET /api/me`.
- A login failure message can mean either wrong credentials or an unreachable/misconfigured backend URL.
- For this project, auth requests are made on the server side through React Router actions/loaders, not directly from React components.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

