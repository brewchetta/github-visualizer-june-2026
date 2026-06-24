"use client";

import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { GitHubBranch } from "@/types/github";

interface Props {
  owner: string;
  repo: string;
  branches: GitHubBranch[];
  current?: string;
}

export default function BranchSelector({
  owner,
  repo,
  branches,
  current,
}: Props) {
  const router = useRouter();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const branch = e.target.value;
    router.push(`/${owner}/${repo}?branch=${encodeURIComponent(branch)}`);
  }

  if (branches.length === 0) return null;

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
      Branch
      <select
        value={current ?? ""}
        onChange={handleChange}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-400"
      >
        {!current && (
          <option value="" disabled>
            Select a branch
          </option>
        )}
        {branches.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  );
}
