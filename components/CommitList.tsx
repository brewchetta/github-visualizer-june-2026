import type { GitHubCommit } from "@/types/github";
import CommitCard from "./CommitCard";

interface Props {
  commits: GitHubCommit[];
  owner: string;
  repo: string;
}

export default function CommitList({ commits, owner, repo }: Props) {
  if (commits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-600">
        <p className="text-zinc-500 dark:text-zinc-400">
          Commits will appear here once the API is connected.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {commits.map((commit) => (
        <li key={commit.sha}>
          <CommitCard commit={commit} owner={owner} repo={repo} />
        </li>
      ))}
    </ul>
  );
}
