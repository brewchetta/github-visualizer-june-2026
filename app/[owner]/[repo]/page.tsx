import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CommitList from "@/components/CommitList";
import Pagination from "@/components/Pagination";
import { fetchCommits } from "@/lib/github";
import type { GitHubCommit } from "@/types/github";

// Must match the per_page used by fetchCommits in lib/github.ts. A full page of
// results implies there may be another page; fewer means we're at the end.
const PER_PAGE = 30;

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  const title = `${owner}/${repo} · Commits`;
  const description = `Browse the recent commit history of ${owner}/${repo} on GitHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "GitHub Commit Visualizer",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function parsePage(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

// Until lib/github.ts (API dev) exposes typed errors, classify a 404 by message.
// This runs on the server, where the original error message is intact.
function isNotFoundError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("404") || msg.includes("not found");
}

export default async function CommitsPage({ params, searchParams }: Props) {
  const { owner, repo } = await params;
  const commits = await fetchCommits(owner, repo);
  const page = parsePage((await searchParams).page);

  let commits: GitHubCommit[];
  try {
    commits = await fetchCommits(owner, repo, page);
  } catch (err) {
    if (isNotFoundError(err)) notFound(); // -> not-found.tsx
    throw err; // -> error.tsx (rate limit / unexpected)
  }

  const hasPrev = page > 1;
  const hasNext = commits.length === PER_PAGE;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {owner}/{repo}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Recent commits
        </p>
      </header>

      <CommitList commits={commits} owner={owner} repo={repo} />

      <Pagination
        owner={owner}
        repo={repo}
        page={page}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

    </main>
  );
}
