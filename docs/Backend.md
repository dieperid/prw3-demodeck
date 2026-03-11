# be-demodeck

Backend Express API with MySQL/MariaDB.

## Prerequisites

- Node.js 20+
- npm
- A running MySQL or MariaDB server

## 1. Install dependencies

```bash
npm install
```

## 2. Create `.env`

Create a `.env` file at the project root:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3001

DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=be_demodeck

DATABASE_URL="mysql://root:root@127.0.0.1:3306/be_demodeck"
SHADOW_DATABASE_URL="mysql://root:root@127.0.0.1:3306/be_demodeck_shadow"

JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=1h
```

Notes:

- The API accepts `DATABASE_*` variables directly.
- `JWT_SECRET` is required. Without it, login cannot generate a token.
- After changing `.env`, restart the API.

## 3. Create the database and schema

Create the database:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p -e "CREATE DATABASE IF NOT EXISTS be_demodeck CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Load the schema:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p be_demodeck < schema.sql
```

Optional connectivity check:

```bash
npm run db:check
```

## 4. Seed demo data

Run:

```bash
npm run db:seed
```

The seed creates demo users, projects, likes, and comments.

Demo accounts:

- `alice` / `demo-alice`
- `bruno` / `demo-bruno`
- `carla` / `demo-carla`

The seed is idempotent for the bundled demo data, so you can run it again to refresh those records.

## 5. Start the API

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

Default base URL:

```text
http://localhost:3000
```

## 6. Manual authentication test

### Register a user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"dora","name":"Dora Demo","password":"demo-dora"}'
```

Expected:

- HTTP `201`
- Response contains `user`
- Response does not contain `password_hash`

### Login

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"demo-alice"}'
```

Expected:

- HTTP `200`
- Response contains `token`
- Response contains `expiresIn`
- JWT payload includes at least `userId`

### Protected route without token

```bash
curl http://localhost:3000/api/me
```

Expected:

- HTTP `401`

### Protected route with token

Replace `<TOKEN>` with the token returned by `/api/login`.

```bash
curl http://localhost:3000/api/me \
  -H "Authorization: Bearer <TOKEN>"
```

Expected:

- HTTP `200`
- Response contains the authenticated user

## 7. Automated authentication test

With the API running, execute:

```bash
npm run auth:test
```

This script checks:

- `GET /api/me` returns `401` without a token
- `POST /api/users` creates a user
- duplicate registration returns `409`
- invalid login returns `401`
- valid login returns a JWT
- `GET /api/me` succeeds with the returned token

Optional overrides:

```bash
API_BASE_URL=http://localhost:3000 TEST_AUTH_USERNAME=my-user TEST_AUTH_PASSWORD=my-pass npm run auth:test
```

## 8. Useful verification commands

Health check:

```bash
curl http://localhost:3000/health
```

Projects list after seeding:

```bash
curl http://localhost:3000/api/projects
```

Expected:

- `/health` returns `{ "status": "ok" }`
- `/api/projects` returns a non-empty array after `npm run db:seed`

