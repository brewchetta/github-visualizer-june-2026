"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import RecentSearches from "./RecentSearches";

const STORAGE_KEY = "gh-visualizer-recent";

interface RecentSearch {
  owner: string;
  repo: string;
}

function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

function saveSearch(owner: string, repo: string): void {
  const filtered = getRecentSearches().filter(
    (s) => !(s.owner === owner && s.repo === repo)
  );
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ owner, repo }, ...filtered].slice(0, 5))
  );
}

function validateOwner(value: string): string {
  if (!value.trim()) return "Owner cannot be empty.";
  if (
    !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/.test(
      value.trim()
    )
  )
    return "Owner must be alphanumeric (hyphens allowed inside), max 39 chars.";
  return "";
}

function validateRepo(value: string): string {
  if (!value.trim()) return "Repository cannot be empty.";
  if (!/^[a-zA-Z0-9._-]{1,100}$/.test(value.trim()))
    return "Repository name can only contain letters, numbers, hyphens, underscores, and dots.";
  return "";
}

export default function SearchForm() {
  const router = useRouter();
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ownerError, setOwnerError] = useState("");
  const [repoError, setRepoError] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const oErr = validateOwner(owner);
    const rErr = validateRepo(repo);
    setOwnerError(oErr);
    setRepoError(rErr);
    if (!oErr && !rErr) {
      saveSearch(owner.trim(), repo.trim());
      setRecentSearches(getRecentSearches());
      router.push(`/${owner.trim()}/${repo.trim()}`);
    }
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-3"
      >
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          GitHub Commit Visualizer
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter a public repository to explore its commit history.
        </p>
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Owner (e.g. vercel)"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              if (submitted) setOwnerError(validateOwner(e.target.value));
            }}
            required
            className={`rounded-lg border px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 bg-white dark:bg-zinc-900 dark:text-zinc-100 ${
              submitted && ownerError
                ? "border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-600 dark:focus:ring-zinc-400"
            }`}
          />
          {submitted && ownerError && (
            <p className="text-xs text-red-500 dark:text-red-400">{ownerError}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Repository (e.g. next.js)"
            value={repo}
            onChange={(e) => {
              setRepo(e.target.value);
              if (submitted) setRepoError(validateRepo(e.target.value));
            }}
            required
            className={`rounded-lg border px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 bg-white dark:bg-zinc-900 dark:text-zinc-100 ${
              submitted && repoError
                ? "border-red-400 focus:ring-red-400"
                : "border-zinc-300 focus:ring-zinc-900 dark:border-zinc-600 dark:focus:ring-zinc-400"
            }`}
          />
          {submitted && repoError && (
            <p className="text-xs text-red-500 dark:text-red-400">{repoError}</p>
          )}
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          View Commits
        </button>
      </form>
      <RecentSearches
        searches={recentSearches}
        onSelect={(o, r) => router.push(`/${o}/${r}`)}
        onClear={handleClear}
      />
    </>
  );
}
