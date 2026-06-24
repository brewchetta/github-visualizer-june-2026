export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <span className="sr-only" role="status">
        Loading graph…
      </span>
      <div className="mb-6 h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-8">
        <div className="h-7 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
      </div>
      <div className="h-[60vh] w-full animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50" />
    </main>
  );
}
