import type {
  GitHubCommit,
  GitHubCommitDetail,
  GitHubBranch,
} from "@/types/github";

const GITHUB_API = "https://api.github.com";
const PER_PAGE = 30;

/**
 * Error thrown when the GitHub API responds with a non-2xx status.
 * Carries the HTTP `status` so callers (e.g. error boundaries) can distinguish
 * 404 (repo not found) from 403/429 (rate limit) and render accordingly.
 */
export class GitHubError extends Error {
  readonly status: number;
  readonly url: string;
  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
    this.url = url;
  }
}

// Shared request headers. Attaches the optional GITHUB_TOKEN to raise the rate
// limit from 60 to 5,000 requests/hr.
function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "github-commit-visualizer", // GitHub rejects requests without UA
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// Reads a descriptive error message from a non-2xx GitHub response body.
async function readErrorDetail(res: Response): Promise<string> {
  let detail = res.statusText;
  try {
    const body = (await res.json()) as { message?: string };
    if (body?.message) detail = body.message;
  } catch {
    /* non-JSON error body; keep statusText */
  }
  return detail;
}

/**
 * Fetch a page of commits for a public GitHub repository.
 * Attaches an Authorization header when GITHUB_TOKEN is set (raises the rate
 * limit from 60 to 5,000 req/hr). Throws GitHubError on a non-2xx response.
 */
export async function fetchCommits(
  owner: string,
  repo: string,
  page = 1,
): Promise<GitHubCommit[]> {
  const url =
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}` +
    `/commits?per_page=${PER_PAGE}&page=${page}`;

  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    throw new GitHubError(`GitHub API ${res.status}: ${detail}`, res.status, url);
  }

  return (await res.json()) as GitHubCommit[];
}

// TODO (API dev): implement this function.
// Call GET https://api.github.com/repos/{owner}/{repo}/commits/{sha}
// The single-commit endpoint returns `stats` and `files[]` (the diff stat) in
// addition to the base commit fields — see GitHubCommitDetail.
// Attach Authorization header if process.env.GITHUB_TOKEN is set (raises rate limit to 5k/hr).
// Throw a descriptive error on non-2xx responses.
export async function fetchCommit(
  _owner: string,
  _repo: string,
  _sha: string
): Promise<GitHubCommitDetail> {
  throw new Error("fetchCommit is not yet implemented");
}

/**
 * Fetch the list of branches for a public GitHub repository.
 * Mirrors fetchCommits' auth + error handling. Throws GitHubError on non-2xx.
 */
export async function fetchBranches(
  owner: string,
  repo: string,
): Promise<GitHubBranch[]> {
  const url =
    `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}` +
    `/branches?per_page=100`;

  const res = await fetch(url, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    throw new GitHubError(`GitHub API ${res.status}: ${detail}`, res.status, url);
  }

  return (await res.json()) as GitHubBranch[];
}
