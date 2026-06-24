import Link from "next/link";

interface Props {
  owner: string;
  repo: string;
  /** Current 1-based page number. */
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
}

// Prev/Next controls for the commits list. State lives in the URL (?page=N) so
// pages are shareable and the back button works. Renders server-side as plain
// links — no client JS required.
export default function Pagination({
  owner,
  repo,
  page,
  hasPrev,
  hasNext,
}: Props) {
  // Nothing to page through (single page of results).
  if (!hasPrev && !hasNext) return null;

  const base = `/${owner}/${repo}`;
  // Drop the query string entirely when returning to page 1 for a clean URL.
  const prevHref = page - 1 <= 1 ? base : `${base}?page=${page - 1}`;
  const nextHref = `${base}?page=${page + 1}`;

  const enabled =
    "rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";
  const disabled =
    "cursor-not-allowed rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-700";

  return (
    <nav
      aria-label="Commit pagination"
      className="mt-6 flex items-center justify-between"
    >
      {hasPrev ? (
        <Link href={prevHref} rel="prev" className={enabled}>
          ← Newer
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true">
          ← Newer
        </span>
      )}

      <span className="text-sm text-zinc-500 dark:text-zinc-400">Page {page}</span>

      {hasNext ? (
        <Link href={nextHref} rel="next" className={enabled}>
          Older →
        </Link>
      ) : (
        <span className={disabled} aria-disabled="true">
          Older →
        </span>
      )}
    </nav>
  );
}
