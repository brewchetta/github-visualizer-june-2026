import type { GitHubCommit } from "@/types/github";

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
