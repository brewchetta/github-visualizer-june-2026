import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchCommits, GitHubError } from "@/lib/github";

// Minimal stand-in for the Response object that fetchCommits consumes.
function mockResponse(opts: {
  ok: boolean;
  status?: number;
  statusText?: string;
  json?: () => unknown;
}) {
  return {
    ok: opts.ok,
    status: opts.status ?? (opts.ok ? 200 : 500),
    statusText: opts.statusText ?? "",
    json: opts.json ?? (async () => []),
  };
}

const fetchMock = vi.fn();

/** Read the (url, init) pair fetchCommits passed to the last fetch call. */
function lastCall() {
  const [url, init] = fetchMock.mock.calls.at(-1) as [
    string,
    { headers: Record<string, string>; next?: { revalidate?: number } },
  ];
  return { url, init };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  delete process.env.GITHUB_TOKEN;
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  delete process.env.GITHUB_TOKEN;
});

describe("fetchCommits", () => {
  it("returns the parsed commit array and sends the expected request", async () => {
    const commits = [{ sha: "abc123" }];
    fetchMock.mockResolvedValue(mockResponse({ ok: true, json: async () => commits }));

    const result = await fetchCommits("vercel", "next.js");

    expect(result).toEqual(commits);

    const { url, init } = lastCall();
    expect(url).toBe(
      "https://api.github.com/repos/vercel/next.js/commits?per_page=30&page=1",
    );
    expect(init.headers).toMatchObject({
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "github-commit-visualizer",
    });
    // No token set -> no Authorization header.
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("attaches a Bearer Authorization header when GITHUB_TOKEN is set", async () => {
    process.env.GITHUB_TOKEN = "secret-token";
    fetchMock.mockResolvedValue(mockResponse({ ok: true, json: async () => [] }));

    await fetchCommits("vercel", "next.js");

    expect(lastCall().init.headers.Authorization).toBe("Bearer secret-token");
  });

  it("URL-encodes path segments and applies the page param", async () => {
    fetchMock.mockResolvedValue(mockResponse({ ok: true, json: async () => [] }));

    await fetchCommits("o", "a b", 2);

    expect(lastCall().url).toBe(
      "https://api.github.com/repos/o/a%20b/commits?per_page=30&page=2",
    );
  });

  it("throws GitHubError with status 404 and GitHub's message", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Not Found" }),
      }),
    );

    const err = await fetchCommits("vercel", "nope").catch((e) => e);
    expect(err).toBeInstanceOf(GitHubError);
    expect(err.status).toBe(404);
    expect(err.message).toBe("GitHub API 404: Not Found");
  });

  it("surfaces a 403 rate-limit error with its status", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => ({ message: "API rate limit exceeded" }),
      }),
    );

    const err = await fetchCommits("vercel", "next.js").catch((e) => e);
    expect(err).toBeInstanceOf(GitHubError);
    expect(err.status).toBe(403);
    expect(err.message).toContain("API rate limit exceeded");
  });

  it("falls back to statusText when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("not json");
        },
      }),
    );

    const err = await fetchCommits("vercel", "next.js").catch((e) => e);
    expect(err).toBeInstanceOf(GitHubError);
    expect(err.status).toBe(500);
    expect(err.message).toBe("GitHub API 500: Internal Server Error");
  });
});
