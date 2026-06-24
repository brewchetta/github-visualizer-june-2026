export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: GitHubCommitAuthor;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

// Error body returned by app/api/commits/route.ts
export interface ApiError {
  error: string;
  status?: number;
}
