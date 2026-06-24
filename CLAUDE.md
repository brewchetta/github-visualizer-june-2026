@AGENTS.md

# GitHub Commit Visualizer

A collaborative Next.js 16 project. Four developers are building features on top of this scaffold simultaneously — read this file before touching any shared code.

## Project structure

```
app/
  layout.tsx              Root layout (fonts, metadata)
  page.tsx                Home page — renders SearchForm
  [owner]/[repo]/
    page.tsx              Commits page — stub, awaiting API dev

components/
  SearchForm.tsx          "use client" — form that routes to /[owner]/[repo]
  CommitList.tsx          Renders GitHubCommit[] or an empty state
  CommitCard.tsx          Single commit row (avatar, sha, message, author, date)

lib/
  github.ts               fetchCommits() stub — NOT YET IMPLEMENTED

types/
  github.ts               GitHubCommit and GitHubCommitAuthor interfaces
```

## Development commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build + type check
npm run lint     # ESLint
```

## Environment variables

Copy `.env.local.example` to `.env.local` before running locally.

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | No | Personal access token — raises rate limit from 60 to 5,000 req/hr |

## Current state of the scaffold

`fetchCommits()` in `lib/github.ts` is a stub that throws. The commits page at `app/[owner]/[repo]/page.tsx` passes an empty array to `CommitList` until the API dev wires it up. Everything else (routing, components, types) is functional.

## Ownership map

| Area | Owner |
|---|---|
| `lib/github.ts`, `app/api/commits/` | API dev |
| `components/CommitCard`, `components/CommitList`, `app/[owner]/[repo]/[sha]/` | Commit display dev |
| `components/SearchForm`, navigation, branch selector | Search & nav dev |
| Loading states, error boundaries, pagination | UX dev |

## Conventions

- **Types first.** Add or extend interfaces in `types/github.ts` before writing fetch logic. Components import types from there, not from inline definitions.
- **No direct GitHub fetches from components.** All GitHub calls go through `lib/github.ts`. If you need a new endpoint, add a new exported function there.
- **New API endpoints** go under `app/api/` — one folder per resource, following the existing `app/api/commits/` pattern once it exists.
- **New pages** go under `app/`. New shared UI goes under `components/`.
- **Tailwind only** for styling. No external component libraries are installed; add one if you need it, but coordinate with the team first.
