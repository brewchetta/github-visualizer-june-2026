import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommitGraph from "@/components/CommitGraph";
import { fetchBranches, fetchCommits } from "@/lib/github";
import { buildGraphLayout } from "@/lib/graph";
import type { GitHubBranch } from "@/types/github";

const GRAPH_COMMIT_COUNT = 100;

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

function isNotFoundError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("404") || msg.includes("not found");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} · Graph`,
    description: `Visual commit graph for ${owner}/${repo}.`,
  };
}

export default async function GraphPage({ params }: Props) {
  const { owner, repo } = await params;

  let commits;
  try {
    commits = await fetchCommits(owner, repo, 1, GRAPH_COMMIT_COUNT);
  } catch (err) {
    if (isNotFoundError(err)) notFound();
    throw err;
  }

  let branches: GitHubBranch[] = [];
  try {
    branches = await fetchBranches(owner, repo);
  } catch {
    branches = [];
  }

  const layout = buildGraphLayout(commits, branches);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <Link
        href={`/${owner}/${repo}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Commits
      </Link>
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {owner}/{repo}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Commit graph · last {commits.length} commits
        </p>
      </header>

      <CommitGraph layout={layout} owner={owner} repo={repo} />
    </main>
  );
}
