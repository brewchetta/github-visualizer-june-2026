// Skeleton UI shown via the Suspense boundary while the commits page fetches.
// Mirrors the real page layout (header + CommitCard rows) to avoid layout shift.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <span className="sr-only" role="status">
        Loading commits…
      </span>

      <header className="mb-8" aria-hidden="true">
        <div className="h-7 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </header>

      <ul className="flex flex-col gap-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
