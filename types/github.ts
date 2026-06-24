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
  parents: GitHubCommitParent[];
}

export interface GitHubCommitParent {
  sha: string;
  url: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

// Error body returned by app/api/commits/route.ts
export interface ApiError {
  error: string;
  status?: number;
}

export interface GitHubCommitFile {
  filename: string;
  status: string; // "added" | "modified" | "removed" | "renamed" | ...
  additions: number;
  deletions: number;
  changes: number;
}

// Shape of the single-commit endpoint: GET /repos/{owner}/{repo}/commits/{sha}
export interface GitHubCommitDetail extends GitHubCommit {
  stats: { total: number; additions: number; deletions: number };
  files: GitHubCommitFile[];
}
