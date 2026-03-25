# DemoDeck Architecture Diagram

This document provides a more detailed view of the project architecture, including the frontend routing layer, shared infrastructure, session/auth flow, and the connection to the backend API.

## 1. High-Level Architecture

```mermaid
flowchart TD
    USER[User Browser]

    subgraph FRONTEND["Frontend App"]
        VITE["Vite dev/build pipeline"]
        RR["React Router 7 SSR app"]
        ROOT["root.tsx\nLayout + navbar + Redux Provider + ToastProvider"]
        ROUTES["Route modules\nhome / auth / authors / projects"]
        COMPONENTS["Reusable UI components"]
        STATE["Redux Toolkit store\nAuth slice"]
        LIB["Shared app/lib helpers"]
    end

    subgraph SESSION["Session & Flash Layer"]
        COOKIE["Cookie session\n__session"]
        AUTH["Auth session\nuser + token"]
        TOAST["Flash toast\nsuccess / error"]
    end

    subgraph BACKEND["Backend Services"]
        API["Express REST API"]
        DB[(MariaDB / MySQL)]
    end

    USER --> VITE
    VITE --> RR
    RR --> ROOT
    ROOT --> ROUTES
    ROUTES --> COMPONENTS
    ROOT --> STATE
    ROUTES --> LIB
    LIB --> COOKIE
    COOKIE --> AUTH
    COOKIE --> TOAST
    LIB --> API
    API --> DB
```

## 2. Frontend Module Structure

```mermaid
flowchart LR
    subgraph APP["app/"]
        ROOT["root.tsx\nGlobal shell"]
        ROUTESCFG["routes.ts\nRoute tree definition"]

        subgraph ROUTES["routes/"]
            HOME["home.tsx"]
            LOGIN["auth/login.tsx"]
            REGISTER["auth/register.tsx"]
            AUTHORS["authors/authorsList.tsx"]
            AUTHOR["authors/authorDetail.tsx"]
            PROJECT["projects/projectDetail.tsx"]
            NEWPROJECT["projects/newProject.tsx"]
            EDITPROJECT["projects/editProject.tsx"]
            MIDDLEWARE["middleware.tsx\nProtected route wrapper"]
            NOTFOUND["notFound.tsx"]
        end

        subgraph COMPONENTS["components/"]
            NAV["Navbar"]
            LIST["ProjectList / ProjectCard"]
            FILTERS["SearchInput / TagFilters / SortSelect / ViewModeToggle"]
            AUTHSCREEN["AuthScreen"]
            EDITOR["ProjectEditorForm"]
            OWNER["ProjectOwnerActions"]
            TOASTUI["ToastProvider"]
            INFO["InfoBlock"]
        end

        subgraph LIB["lib/"]
            AUTHSRV["auth.server.ts"]
            PROJSRV["projects.server.ts"]
            AUTHS["authors.server.ts"]
            BACKENDSRV["backend.server.ts"]
            SESSIONSRV["session.server.ts"]
            TOASTLIB["toast.ts"]
            PROJECTFORM["project-form.ts"]
            PROJECTMAP["projects.ts"]
        end

        subgraph STATE["state/"]
            AUTHSLICE["auth/authSlice.ts"]
            AUTHTYPES["auth/types.ts"]
        end

        subgraph CONFIG["config/"]
            STORE["store.ts"]
            HOOKS["hooks.ts"]
            ENV["env.server.ts"]
        end
    end

    ROUTESCFG --> ROOT
    ROOT --> NAV
    ROOT --> TOASTUI
    ROOT --> STORE
    STORE --> AUTHSLICE
    AUTHSLICE --> AUTHTYPES
    ROOT --> HOOKS

    HOME --> LIST
    HOME --> FILTERS
    LOGIN --> AUTHSCREEN
    REGISTER --> AUTHSCREEN
    PROJECT --> INFO
    PROJECT --> OWNER
    NEWPROJECT --> EDITOR
    EDITPROJECT --> EDITOR
    MIDDLEWARE --> NEWPROJECT
    MIDDLEWARE --> EDITPROJECT

    HOME --> PROJSRV
    AUTHORS --> AUTHS
    AUTHOR --> AUTHS
    PROJECT --> PROJSRV
    LOGIN --> AUTHSRV
    REGISTER --> AUTHSRV
    NEWPROJECT --> PROJECTFORM
    NEWPROJECT --> PROJSRV
    EDITPROJECT --> PROJECTFORM
    EDITPROJECT --> PROJSRV

    AUTHSRV --> SESSIONSRV
    SESSIONSRV --> TOASTLIB
    AUTHSRV --> BACKENDSRV
    PROJSRV --> BACKENDSRV
    AUTHS --> BACKENDSRV
    BACKENDSRV --> ENV
    PROJECTMAP --> PROJSRV
```

## 3. Request / Data Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as React Router Route
    participant L as app/lib/*.server.ts
    participant S as Session Cookie
    participant A as Backend API
    participant D as Database

    B->>R: Navigate or submit form
    R->>L: Call loader/action helper
    L->>S: Read auth session / flash toast
    L->>A: Fetch /api/*
    A->>D: Query or mutate data
    D-->>A: Result
    A-->>L: JSON response
    L-->>R: Normalized app data or error
    R-->>B: Render UI or redirect
    R->>S: Commit session changes when needed\n(auth cookie, logout, flashed toast)
```

## 4. Authentication and Session Flow

```mermaid
flowchart TD
    LOGINFORM["Login or Register form submission"]
    AUTHROUTE["auth/login.tsx or auth/register.tsx action"]
    AUTHSRV["auth.server.ts"]
    SESSION["session.server.ts"]
    COOKIE["__session cookie"]
    ROOT["root.tsx loader"]
    STORE["Redux auth slice"]
    UI["Authenticated UI state"]
    API["Backend /api/login /api/users /api/me"]

    LOGINFORM --> AUTHROUTE
    AUTHROUTE --> AUTHSRV
    AUTHSRV --> API
    API --> AUTHSRV
    AUTHSRV --> SESSION
    SESSION --> COOKIE
    COOKIE --> ROOT
    ROOT --> STORE
    STORE --> UI
```

### Notes

- The session cookie stores the backend token and authenticated user metadata.
- `root.tsx` reads the authenticated session on every request and hydrates the Redux auth slice.
- Protected routes (`projects/new` and `projects/:id/edit`) are guarded through `routes/middleware.tsx` and auth checks inside route actions.

## 5. Toast / Flash Message Flow

```mermaid
flowchart TD
    ACTION["Route action succeeds or fails"]
    SESSION["session.server.ts"]
    TOAST["toast.ts\nToast payload"]
    COOKIE["Flash toast in cookie session"]
    ROOTLOADER["root.tsx loader"]
    PROVIDER["ToastProvider"]
    USER["User sees success/error toast"]

    ACTION --> TOAST
    TOAST --> SESSION
    SESSION --> COOKIE
    COOKIE --> ROOTLOADER
    ROOTLOADER --> PROVIDER
    PROVIDER --> USER
```

### Notes

- Redirect-based actions flash a one-time toast into the session cookie.
- The root loader reads and clears the flash message.
- `ToastProvider` displays global notifications for success and error states.
- Same-page action feedback can also be pushed directly from route components into the toast provider.

## 6. Backend Integration Boundaries

```mermaid
flowchart LR
    subgraph FRONT["Frontend Route Helpers"]
        AUTHLIB["auth.server.ts"]
        AUTHORLIB["authors.server.ts"]
        PROJECTLIB["projects.server.ts"]
    end

    BACKEND["backend.server.ts\nfetch wrapper + response parsing"]
    ENV["env.server.ts\nBACKEND_API_URL"]

    subgraph API["Backend REST API"]
        USERS["/api/users"]
        LOGIN["/api/login"]
        ME["/api/me"]
        PROJECTS["/api/projects"]
        AUTHORS["/api/authors"]
    end

    AUTHLIB --> BACKEND
    AUTHORLIB --> BACKEND
    PROJECTLIB --> BACKEND
    BACKEND --> ENV

    BACKEND --> USERS
    BACKEND --> LOGIN
    BACKEND --> ME
    BACKEND --> PROJECTS
    BACKEND --> AUTHORS
```

## 7. Functional Areas Covered by the Current Codebase

```mermaid
mindmap
  root((DemoDeck))
    Authentication
      Login
      Registration
      Logout
      Session cookie
      Redux auth state
    Project browsing
      Gallery
      Search
      Sort
      Tag filtering
      View mode toggle
    Project details
      Author info
      Likes
      Comments
      External demo link
      GitHub link
    Project management
      Create project
      Edit project
      Delete project
      Owner actions
      Form validation
    Authors
      Author list
      Author detail
    Feedback
      Inline validation
      Flash toasts
      Error boundaries
```

## 8. Summary

At a high level, the project is a server-rendered React Router application that delegates all business data to a backend REST API. Route loaders and actions are the main orchestration layer: they read session state, call server helpers from `app/lib/`, normalize API responses, and render route components. Global concerns such as authentication, session management, and toast notifications are centralized in the root/session infrastructure, while feature-specific UI lives in route modules and reusable components.
