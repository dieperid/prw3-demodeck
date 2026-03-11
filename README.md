# prw3 DemoDeck

A full-stack React application designed for showcasing and exploring developer projects. Users can browse a gallery of projects, filter by technologies, view author profiles, and register/login to publish their own work.

Built with **React 19**, **React Router 7**, **Redux Toolkit**, and **Tailwind CSS v4**.

## Prerequisites

To run this project, ensure you have the following installed:

- **Node.js**
- **npm**
- **Docker** (Optional)

## Getting Started

### Locally

1. **Clone the repository**:

```bash
    git clone https://github.com/dieperid/prw3-demodeck.git
    cd prw3-demodeck
```

2. **Install dependencies**:

```bash
npm install

```

3. **Configure Environment Variables**:
   Copy the .env.example file and modify the variables as needed:

```bash
cp .env.example .env
```

This is what the .env file should contain:

```env
BACKEND_API_URL=http://localhost:8080/api
SESSION_SECRET=your_super_secret_session_key
```

- `BACKEND_API_URL`: The url of the backend service of this website
- `SESSION_SECRET`: String used to sign the session cookie

4. **Start the development server**:

```bash
npm run dev

```

The application will be available at `http://localhost:5173`.

### With Docker

The project includes a multi-stage `Dockerfile` optimized for production, but it can also be used to run the app locally in an isolated environment.

1. **Build the Docker image**:

```bash
docker build -t demodeck:latest .
```

2. **Configure Environment Variables**:

See step 3 of the local setup for more details.

3. **Run the container**:

```bash
docker run -p 3000:3000 --env-file .env demodeck:latest

```

The application will be accessible at `http://localhost:3000`.

## Project Architecture

The `app/` directory is structured as follows:

```text
app/
├── components/
├── config/          # Global configuration (e.g., Redux store setup, typed ENV vars)
├── data/            # Local mock data and fake API fetchers
├── helpers/
├── lib/             # Application infrastructure (e.g., Session management, utilities)
├── routes/
├── services/
└── state/           # Global state slices (Redux Toolkit)
```

Other files and folders outside of `app/` are the default `react-router` scaffold.

## Conventions

This project uses the following conventions for git:

- [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Conventional branch](https://conventional-branch.github.io/)

## Project collaboration

This project uses `GitHub Issues`, `Pull Requests` and `GitHub Projects` for collaboration.
