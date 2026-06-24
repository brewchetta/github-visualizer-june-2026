import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchCommit } from "@/lib/github";
import type { GitHubCommitDetail } from "@/types/github";

interface Props {
  params: Promise<{ owner: string; repo: string; sha: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo, sha } = await params;
  return { title: `${sha.slice(0, 7)} · ${owner}/${repo}` };
}

export default async function CommitDetailPage({ params }: Props) {
  const { owner, repo, sha } = await params;

  let commit: GitHubCommitDetail | null = null;
  try {
    commit = await fetchCommit(owner, repo, sha);
  } catch {
    // fetchCommit is a stub until the API dev lands it — fall through to the
    // graceful placeholder below rather than crashing the route.
    commit = null;
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <Link
        href={`/${owner}/${repo}`}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← Back to {owner}/{repo}
      </Link>

      {commit ? (
        <CommitDetail commit={commit} />
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-600">
          <p className="text-zinc-500 dark:text-zinc-400">
            Commit details will appear here once the API is connected.
          </p>
          <p className="mt-1 font-mono text-sm text-zinc-400 dark:text-zinc-500">
            {sha.slice(0, 7)}
          </p>
        </div>
      )}
    </main>
  );
}

function CommitDetail({ commit }: { commit: GitHubCommitDetail }) {
  const authorName = commit.author?.login ?? commit.commit.author.name;
  const avatarUrl = commit.author?.avatar_url;
  const date = new Date(commit.commit.author.date).toLocaleString();

  return (
    <article className="mt-8 flex flex-col gap-6">
      <header className="flex items-start gap-3">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt={authorName}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {authorName}
            </span>
            <span>·</span>
            <a
              href={commit.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {commit.sha.slice(0, 7)}
            </a>
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
      </header>

      <pre className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-4 font-sans text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
        {commit.commit.message}
      </pre>

      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            {commit.files.length} file{commit.files.length === 1 ? "" : "s"}{" "}
            changed
          </span>
          <span className="font-mono text-green-600 dark:text-green-400">
            +{commit.stats.additions}
          </span>
          <span className="font-mono text-red-600 dark:text-red-400">
            −{commit.stats.deletions}
          </span>
        </div>
        <ul className="flex flex-col gap-1">
          {commit.files.map((file) => (
            <li
              key={file.filename}
              className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <span className="truncate font-mono text-zinc-900 dark:text-zinc-100">
                {file.filename}
              </span>
              <span className="flex shrink-0 items-center gap-2 font-mono text-xs">
                <span className="text-green-600 dark:text-green-400">
                  +{file.additions}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  −{file.deletions}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
