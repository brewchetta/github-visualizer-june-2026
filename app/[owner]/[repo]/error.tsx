"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";

// Catches unexpected runtime errors thrown while rendering this route segment —
// most importantly a GitHub rate-limit response from fetchCommits(). Repo-not-found
// is handled separately via notFound() -> not-found.tsx.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Surface to the console (and any error-reporting service) for debugging.
    console.error(error);
  }, [error]);

  // Best-effort classification. The server component sees the real message; in
  // production Next.js sanitizes it before it reaches the client, so the generic
  // copy below also names rate-limiting as a likely cause.
  const message = error.message?.toLowerCase() ?? "";
  const isRateLimit = message.includes("rate limit") || message.includes("403");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
        <h1 className="text-lg font-semibold text-red-900 dark:text-red-200">
          {isRateLimit ? "GitHub rate limit reached" : "Couldn’t load commits"}
        </h1>
        <p className="mt-2 text-sm text-red-800/80 dark:text-red-200/70">
          {isRateLimit
            ? "You’ve hit GitHub’s API rate limit. Unauthenticated requests are capped at 60 per hour. Add a GITHUB_TOKEN to raise it to 5,000/hr, or wait a few minutes and try again."
            : "Something went wrong while fetching commits. The repository may be temporarily unavailable, or you may have hit GitHub’s rate limit. Please try again in a moment."}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => unstable_retry()}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Back to search
          </Link>
        </div>
      </div>
    </main>
  );
}
