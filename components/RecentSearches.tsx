interface RecentSearch {
  owner: string;
  repo: string;
}

interface Props {
  searches: RecentSearch[];
  onSelect: (owner: string, repo: string) => void;
  onClear: () => void;
}

export default function RecentSearches({ searches, onSelect, onClear }: Props) {
  if (searches.length === 0) return null;

  return (
    <div className="mt-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Recent searches
        </span>
        <button
          onClick={onClear}
          className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Clear
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {searches.map((s) => (
          <li key={`${s.owner}/${s.repo}`}>
            <button
              onClick={() => onSelect(s.owner, s.repo)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-left text-sm text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              {s.owner}/{s.repo}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
