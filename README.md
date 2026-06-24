# GitHub Commit Visualizer

A Next.js app for exploring commit history on any public GitHub repository. Enter an owner and repo name, and browse recent commits.

Built as a collaborative scaffold — see the [ownership map](#ownership-map) below for who owns what.

## Getting started

```bash
cp .env.local.example .env.local   # optional: add a GitHub token for higher rate limits
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a repo (e.g. `vercel` / `next.js`), and you'll land on `/vercel/next.js`.

## Stack

- [Next.js 16](https://nextjs.org) — App Router
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [GitHub REST API](https://docs.github.com/en/rest/commits/commits)

## Project structure

```
app/
  page.tsx                  Home — search form
  [owner]/[repo]/page.tsx   Commits list for a repo

components/
  SearchForm.tsx            Repo search input
  CommitList.tsx            List of commits
  CommitCard.tsx            Individual commit row

lib/
  github.ts                 GitHub API client (stub — see below)

types/
  github.ts                 Shared TypeScript interfaces
```

## GitHub token

Without a token, the GitHub API allows 60 requests/hr per IP. To raise that to 5,000/hr, create a [personal access token](https://github.com/settings/tokens) (no scopes needed for public repos) and add it to `.env.local`:

```
GITHUB_TOKEN=your_token_here
```

## Ownership map

This project is split across four developers:

| Feature | Files |
|---|---|
| **API layer** | `lib/github.ts`, `app/api/commits/` |
| **Commit display** | `components/CommitCard`, `components/CommitList`, `app/[owner]/[repo]/[sha]/` |
| **Search & navigation** | `components/SearchForm`, branch selector |
| **UX & infrastructure** | Loading states, error handling, pagination |

## Current status

The API layer (`lib/github.ts`) is a stub — commits render as an empty placeholder until it is implemented. All routing and UI components are in place.
