import CommitList from "@/components/CommitList";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export default async function CommitsPage({ params }: Props) {
  const { owner, repo } = await params;

  // TODO (API dev): replace the empty array with:
  //   const commits = await fetchCommits(owner, repo);
  // Import fetchCommits from "@/lib/github" once it's implemented.

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
      <CommitList commits={[]} />
    </main>
  );
}
