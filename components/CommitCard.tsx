import type { GitHubCommit } from "@/types/github";
import Image from "next/image";

interface Props {
  commit: GitHubCommit;
}

export default function CommitCard({ commit }: Props) {
  const firstLine = commit.commit.message.split("\n")[0];
  const shortSha = commit.sha.slice(0, 7);
  const date = new Date(commit.commit.author.date).toLocaleDateString();
  const authorName = commit.author?.login ?? commit.commit.author.name;
  const avatarUrl = commit.author?.avatar_url;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={authorName}
          width={36}
          height={36}
          className="rounded-full"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
          {firstLine}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{authorName}</span>
          <span>·</span>
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {shortSha}
          </a>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
