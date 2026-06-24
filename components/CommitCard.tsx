import type { GitHubCommit } from "@/types/github";
import Image from "next/image";
import Link from "next/link";

interface Props {
  commit: GitHubCommit;
  owner: string;
  repo: string;
}

export default function CommitCard({ commit, owner, repo }: Props) {
  const [firstLine, ...rest] = commit.commit.message.split("\n");
  const body = rest.join("\n").trim();
  const shortSha = commit.sha.slice(0, 7);
  const date = new Date(commit.commit.author.date).toLocaleDateString();
  const authorName = commit.author?.login ?? commit.commit.author.name;
  const avatarUrl = commit.author?.avatar_url;

  return (
    <div className="relative flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600">
      {/* Full-bleed link overlay: the whole card navigates to the detail page,
          while the avatar and external SHA link stay independently clickable
          above it (relative z-10). Avoids nesting <a> inside <a>. */}
      <Link
        href={`/${owner}/${repo}/${commit.sha}`}
        aria-label={`View commit ${shortSha}: ${firstLine}`}
        className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
      />
      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt={authorName}
          width={36}
          height={36}
          className="relative z-10 rounded-full"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
          {firstLine}
        </p>
        {body && (
          <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
            {body}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{authorName}</span>
          <span>·</span>
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 font-mono hover:text-zinc-900 dark:hover:text-zinc-100"
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
