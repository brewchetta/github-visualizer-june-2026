import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { fetchCommits, GitHubError } from "@/lib/github";

// Mock only fetchCommits; keep the real GitHubError so `instanceof` checks in
// the route handler still work.
vi.mock("@/lib/github", async (orig) => ({
  ...(await orig<typeof import("@/lib/github")>()),
  fetchCommits: vi.fn(),
}));

const fetchCommitsMock = vi.mocked(fetchCommits);

function call(query: string) {
  return GET(new Request(`http://localhost/api/commits${query}`));
}

beforeEach(() => {
  fetchCommitsMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/commits", () => {
  it("returns 400 when owner or repo is missing", async () => {
    const res = await call("?owner=vercel");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Missing required query params: owner and repo",
    });
    expect(fetchCommitsMock).not.toHaveBeenCalled();
  });

  it.each(["abc", "0", "-1"])("returns 400 for invalid page %s", async (page) => {
    const res = await call(`?owner=vercel&repo=next.js&page=${page}`);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid page param");
    expect(fetchCommitsMock).not.toHaveBeenCalled();
  });

  it("returns 200 with the commits and forwards the parsed page", async () => {
    const commits = [{ sha: "abc123" }];
    fetchCommitsMock.mockResolvedValue(commits as never);

    const res = await call("?owner=vercel&repo=next.js&page=3");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(commits);
    expect(fetchCommitsMock).toHaveBeenCalledWith("vercel", "next.js", 3);
  });

  it("defaults to page 1 when no page param is given", async () => {
    fetchCommitsMock.mockResolvedValue([] as never);

    await call("?owner=vercel&repo=next.js");

    expect(fetchCommitsMock).toHaveBeenCalledWith("vercel", "next.js", 1);
  });

  it("maps a GitHubError to the matching HTTP status and error body", async () => {
    fetchCommitsMock.mockRejectedValue(
      new GitHubError("GitHub API 404: Not Found", 404, "https://api.github.com/x"),
    );

    const res = await call("?owner=vercel&repo=nope");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: "GitHub API 404: Not Found",
      status: 404,
    });
  });

  it("returns a generic 500 for non-GitHub errors (no internal detail leaked)", async () => {
    fetchCommitsMock.mockRejectedValue(new Error("socket exploded"));

    const res = await call("?owner=vercel&repo=next.js");

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
