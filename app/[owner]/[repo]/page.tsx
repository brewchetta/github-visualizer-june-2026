import Link from "next/link";
import CommitList from "@/components/CommitList";
import BranchSelector from "@/components/BranchSelector";
import { fetchBranches } from "@/lib/github";
import type { GitHubBranch } from "@/types/github";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ branch?: string }>;
}

export default async function CommitsPage({ params, searchParams }: Props) {
  const { owner, repo } = await params;
  const { branch } = await searchParams;

  // TODO (API dev): replace the empty array with:
  //   const commits = await fetchCommits(owner, repo, 1, branch);
  // Import fetchCommits from "@/lib/github" once it's implemented.
  // The selected `branch` (if any) should be passed through as the `sha` param.

  // Branch list is non-critical: if the GitHub call fails (rate limit, missing
  // repo), render the page without the selector. Error UI is the UX dev's domain.
  let branches: GitHubBranch[] = [];
  try {
    branches = await fetchBranches(owner, repo);
  } catch {
    branches = [];
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back
      </Link>
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {owner}/{repo}
          </h1>
          <BranchSelector
            owner={owner}
            repo={repo}
            branches={branches}
            current={branch}
          />
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Recent commits
        </p>
      </header>
      <CommitList commits={[]} />
    </main>
  );
}
