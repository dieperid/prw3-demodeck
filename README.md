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

## Backend Authentication Integration

The current login flow is mocked so the frontend can already handle:

- login form submission
- auth error display
- JWT persistence in local storage
- Redux auth state updates
- protected-route checks through the auth cookie

Current demo credentials:

```txt
identifier: student
password: password
```

### Files involved

- `app/lib/auth.server.ts`
- `app/lib/auth.client.ts`
- `app/routes/auth/login.tsx`
- `app/components/AuthScreen.tsx`
- `app/state/auth/authSlice.ts`
- `app/root.tsx`

### Current flow

1. The login form submits to the route action in `app/routes/auth/login.tsx`.
2. The action calls `authenticateUser(...)` from `app/lib/auth.server.ts`.
3. On success, the action returns:
   - `token`
   - `user`
   - `redirectTo`
4. `AuthScreen` stores the token in local storage with `auth.client.ts`.
5. `AuthScreen` dispatches `setCredentials(...)` to Redux.
6. `root.tsx` restores auth state from storage after reload.

### How to connect the real backend

Replace the mock implementation inside `authenticateUser(...)` in `app/lib/auth.server.ts`.

Expected return shape:

```ts
type AuthSession = {
  token: string;
  user: {
    id: string;
    name: string;
  };
};
```

### Example backend integration

If your backend exposes `POST /auth/login`, `authenticateUser(...)` can become:

```ts
export async function authenticateUser(identifier: string, password: string) {
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return {
    token: data.token,
    user: {
      id: data.user.id,
      name: data.user.name,
    },
  };
}
```

If `authenticateUser(...)` becomes async, also update the login action:

```ts
const session = await authenticateUser(identifier, password);
```

### Backend response contract

To avoid changing the frontend, the backend login response should provide at least:

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "123",
    "name": "Jane Doe"
  }
}
```

### Token storage options

The current implementation uses both:

- a client-stored token in `localStorage`
- a server-readable auth cookie for route protection

When the real backend is ready, choose one of these strategies:

1. `HttpOnly` cookie only
2. JWT in frontend storage
3. access token + refresh token

For a production app, `HttpOnly` cookie auth is usually safer than storing the JWT in `localStorage`.

### If the backend returns more user fields

If your backend also returns `email`, `role`, or other user data:

1. Extend `AuthState` in `app/state/auth/types.ts`
2. Update `setCredentials(...)` in `app/state/auth/authSlice.ts`
3. Update the stored session type in `app/lib/auth.client.ts`

### Recommended next cleanup

Before plugging in the real API, a good next step would be to extract backend calls into:

```txt
app/lib/auth.api.ts
```

That keeps route actions and UI logic independent from the backend client.

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

---

Built with ❤️ using React Router.
