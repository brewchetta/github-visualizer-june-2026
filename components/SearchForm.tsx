"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm() {
  const router = useRouter();
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const o = owner.trim();
    const r = repo.trim();
    if (o && r) {
      router.push(`/${o}/${r}`);
    }
  }

  return (
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
      <input
        type="text"
        placeholder="Owner (e.g. vercel)"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        required
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-400"
      />
      <input
        type="text"
        placeholder="Repository (e.g. next.js)"
        value={repo}
        onChange={(e) => setRepo(e.target.value)}
        required
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-400"
      />
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        View Commits
      </button>
    </form>
  );
}
