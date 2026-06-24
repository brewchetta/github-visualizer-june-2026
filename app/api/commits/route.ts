import { NextResponse } from "next/server";
import { fetchCommits, GitHubError } from "@/lib/github";
import type { ApiError } from "@/types/github";

// GET /api/commits?owner=<owner>&repo=<repo>&page=<n>
// Token-safe proxy to the GitHub commits API for client-side consumers.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const pageParam = searchParams.get("page");

  if (!owner || !repo) {
    const body: ApiError = {
      error: "Missing required query params: owner and repo",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const page = Number(pageParam ?? "1");
  if (!Number.isInteger(page) || page < 1) {
    const body: ApiError = {
      error: "Invalid page param: must be a positive integer",
    };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const commits = await fetchCommits(owner, repo, page);
    return NextResponse.json(commits);
  } catch (err) {
    if (err instanceof GitHubError) {
      const body: ApiError = { error: err.message, status: err.status };
      return NextResponse.json(body, { status: err.status });
    }
    const body: ApiError = { error: "Internal server error" };
    return NextResponse.json(body, { status: 500 });
  }
}
