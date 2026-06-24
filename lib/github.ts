import type { GitHubCommit, GitHubBranch } from "@/types/github";

// Builds request headers for the GitHub REST API, attaching the optional
// GITHUB_TOKEN to raise the rate limit from 60 to 5,000 requests/hr.
function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// TODO (API dev): implement this function.
// Call GET https://api.github.com/repos/{owner}/{repo}/commits?page={page}&per_page=30
// Attach Authorization header if process.env.GITHUB_TOKEN is set (raises rate limit to 5k/hr).
// Throw a descriptive error on non-2xx responses.
export async function fetchCommits(
  _owner: string,
  _repo: string,
  _page = 1
): Promise<GitHubCommit[]> {
  throw new Error("fetchCommits is not yet implemented");
}

// Fetches the list of branches for a repository.
// GET https://api.github.com/repos/{owner}/{repo}/branches?per_page=100
export async function fetchBranches(
  owner: string,
  repo: string
): Promise<GitHubBranch[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
    { headers: githubHeaders() }
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch branches for ${owner}/${repo}: ${res.status} ${res.statusText}`
    );
  }
  return res.json();
}
