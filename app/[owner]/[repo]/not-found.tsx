import Link from "next/link";

// Rendered when the commits page calls notFound() — i.e. GitHub returned 404 for
// the requested owner/repo (wrong name, or a private/deleted repository).
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-600">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Repository not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          We couldn’t find that repository on GitHub. Double-check the owner and
          name, and make sure the repository is public.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Back to search
        </Link>
      </div>
    </main>
  );
}
