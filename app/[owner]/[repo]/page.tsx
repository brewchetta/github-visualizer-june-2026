import CommitList from "@/components/CommitList";
import { fetchCommits } from "@/lib/github";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function CommitsPage({ params }: Props) {
  const { owner, repo } = await params;
  const commits = await fetchCommits(owner, repo);

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
      <CommitList commits={commits} />
    </main>
  );
}
