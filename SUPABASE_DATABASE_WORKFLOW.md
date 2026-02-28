# Local Database + Cloud Upload (Supabase)

This project already uses Supabase and has SQL migrations in `supabase/migrations/`.
Use the workflow below to run a **local database** and then **upload schema changes to cloud**.

## 1) Prerequisites

- Docker Desktop running
- Node.js + npm installed
- Supabase CLI available via `npx supabase ...`

> Note: `npm run db:*` commands now include a Docker pre-check and will show clear error messages if Docker is missing or not running.

## 2) Local database setup

If this is the first time on this repo, initialize Supabase config:

```bash
npm run db:init
```

Start local Supabase services:

```bash
npm run db:start
```

Check status and local URLs/keys:

```bash
npm run db:status
```

Reset local DB and re-run all migrations (useful during development):

```bash
npm run db:reset
```

## 3) Create/update migrations from local changes

When you make schema changes locally, create a migration file:

```bash
npx supabase db diff -f your_migration_name
```

This creates a new SQL file inside `supabase/migrations/`.

## 4) Upload (push) migrations to cloud Supabase project

Login to Supabase CLI:

```bash
npx supabase login
```

Link this repo to your cloud project (get project ref from Supabase dashboard):

```bash
npm run db:link
```

Push all pending migrations to cloud:

```bash
npm run db:push
```

## 5) Optional: pull cloud changes back to local migrations

If changes were made in cloud SQL editor and you need them in repo:

```bash
npm run db:pull
```

## 6) Troubleshooting on Windows

### Error: `docker` is not recognized

This means Docker Desktop is not installed (or PATH not refreshed).

1. Install Docker Desktop: https://docs.docker.com/desktop
2. Restart VS Code/terminal
3. Run again:

```bash
npm run db:start
```

### Error: `pipe/docker_engine` or `error during connect`

This means Docker is installed but daemon is not running/reachable.

1. Open Docker Desktop
2. Wait for status: **Engine running**
3. Re-run command in a new terminal (Administrator if required):

```bash
npm run db:start
```

### Warning: `npm warn deprecated node-domexception@1.0.0`

This warning is from a transient dependency and does **not** block Supabase setup.

## Added npm scripts

The following scripts are available in `package.json`:

- `db:init`
- `db:start`
- `db:stop`
- `db:status`
- `db:reset`
- `db:link`
- `db:push`
- `db:pull`
