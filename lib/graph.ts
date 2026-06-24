import type { GitHubBranch, GitHubCommit } from "@/types/github";

export type CommitType =
  | "feat"
  | "fix"
  | "docs"
  | "chore"
  | "refactor"
  | "test"
  | "merge"
  | "other";

export interface GraphNode {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  date: string;
  commitType: CommitType;
  row: number;
  col: number;
  isMain: boolean;
  x: number;
  y: number;
  parentShas: string[];
  branchNames: string[];
}

export interface GraphEdge {
  fromSha: string;
  toSha: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isMerge: boolean;
  isMain: boolean;
  color: string;
}

export interface GraphLayout {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalWidth: number;
  totalHeight: number;
  centerX: number;
}

export const ROW_HEIGHT = 56;
export const COL_WIDTH = 88;
export const NODE_RADIUS = 8;

const TOP_MARGIN = 36;
const SIDE_PADDING = 44;
const MAX_LANES = 8;

// The main trunk gets its own distinct, heavier colour so it reads as the
// spine of the tree. Fuchsia is well clear of refactor's amber and the other
// commit-type hues, so the trunk never blends into a node colour.
export const MAIN_COLOR = "#d946ef";

// Every non-main branch line shares one neutral colour. Lane position carries
// no meaning worth a legend, and a rainbow of lane hues just clashes with the
// commit-type dot colours — so lines only ever signal "main" vs "branch".
export const BRANCH_COLOR = "#94a3b8";

const COMMIT_TYPE_PATTERNS: [RegExp, CommitType][] = [
  [/^feat(ure)?(\(.+?\))?[!]?:/i, "feat"],
  [/^(fix|bugfix|hotfix)(\(.+?\))?[!]?:/i, "fix"],
  [/^docs(\(.+?\))?[!]?:/i, "docs"],
  [/^refactor(\(.+?\))?[!]?:/i, "refactor"],
  [/^test(\(.+?\))?[!]?:/i, "test"],
  [/^chore(\(.+?\))?[!]?:/i, "chore"],
];

export function detectCommitType(message: string): CommitType {
  const firstLine = message.split("\n")[0].trim();
  for (const [pattern, type] of COMMIT_TYPE_PATTERNS) {
    if (pattern.test(firstLine)) return type;
  }
  return "other";
}

export const COMMIT_TYPE_COLORS: Record<CommitType, string> = {
  feat: "#3b82f6",
  fix: "#ef4444",
  docs: "#a855f7",
  refactor: "#f59e0b",
  test: "#14b8a6",
  chore: "#6b7280",
  merge: "#6366f1",
  other: "#71717a",
};

export function laneColor(col: number): string {
  return col === 0 ? MAIN_COLOR : BRANCH_COLOR;
}

// Map a lane index to a horizontal offset measured in columns from the centre.
// Lane 0 sits dead centre; subsequent lanes alternate right, left, right…
// so the graph fans out symmetrically on both sides of the main trunk.
function colToOffset(col: number): number {
  if (col === 0) return 0;
  const magnitude = Math.ceil(col / 2);
  return col % 2 === 1 ? magnitude : -magnitude;
}

function findFirstFreeSlot(lanes: (string | null)[]): number {
  const idx = lanes.indexOf(null);
  if (idx !== -1) return idx;
  lanes.push(null);
  return lanes.length - 1;
}

function trimTrailingNulls(lanes: (string | null)[]): void {
  while (lanes.length > 0 && lanes[lanes.length - 1] === null) {
    lanes.pop();
  }
}

export function buildGraphLayout(
  commits: GitHubCommit[],
  branches: GitHubBranch[],
): GraphLayout {
  const branchHeads = new Map<string, string[]>();
  for (const branch of branches) {
    const existing = branchHeads.get(branch.commit.sha) ?? [];
    existing.push(branch.name);
    branchHeads.set(branch.commit.sha, existing);
  }

  const activeLanes: (string | null)[] = [];
  const nodes: GraphNode[] = [];
  const shaToNode = new Map<string, GraphNode>();

  for (let row = 0; row < commits.length; row++) {
    const commit = commits[row];
    const { sha } = commit;
    const parentShas = (commit.parents ?? []).map((p) => p.sha);

    let col = activeLanes.indexOf(sha);
    if (col === -1) {
      col = findFirstFreeSlot(activeLanes);
      activeLanes[col] = sha;
    }

    activeLanes[col] = null;

    for (let i = 0; i < parentShas.length; i++) {
      const parentSha = parentShas[i];
      if (activeLanes.indexOf(parentSha) !== -1) continue;

      if (i === 0) {
        if (activeLanes[col] === null) {
          activeLanes[col] = parentSha;
        } else {
          activeLanes[findFirstFreeSlot(activeLanes)] = parentSha;
        }
      } else {
        activeLanes[findFirstFreeSlot(activeLanes)] = parentSha;
      }
    }

    trimTrailingNulls(activeLanes);

    const clampedCol = Math.min(col, MAX_LANES - 1);
    const firstLine = commit.commit.message.split("\n")[0];
    // A commit with 2+ parents is a merge — that takes precedence over any
    // Conventional-Commit prefix, since merge messages rarely carry one.
    const commitType: CommitType =
      parentShas.length > 1
        ? "merge"
        : detectCommitType(commit.commit.message);
    const node: GraphNode = {
      sha,
      shortSha: sha.slice(0, 7),
      message: firstLine,
      authorName: commit.commit.author.name,
      date: commit.commit.author.date,
      commitType,
      row,
      col: clampedCol,
      isMain: clampedCol === 0,
      x: 0, // set below once we know the centre
      y: TOP_MARGIN + row * ROW_HEIGHT,
      parentShas,
      branchNames: (branchHeads.get(sha) ?? []).slice(0, 2),
    };

    nodes.push(node);
    shaToNode.set(sha, node);
  }

  // Work out how far the tree spreads left and right, then anchor the centre.
  let minOffset = 0;
  let maxOffset = 0;
  for (const node of nodes) {
    const offset = colToOffset(node.col);
    if (offset < minOffset) minOffset = offset;
    if (offset > maxOffset) maxOffset = offset;
  }

  const centerX = SIDE_PADDING + -minOffset * COL_WIDTH;
  for (const node of nodes) {
    node.x = centerX + colToOffset(node.col) * COL_WIDTH;
  }

  const edges: GraphEdge[] = [];
  for (const node of nodes) {
    for (const parentSha of node.parentShas) {
      const parentNode = shaToNode.get(parentSha);
      if (!parentNode) continue;
      const isMain = node.isMain && parentNode.isMain;
      edges.push({
        fromSha: node.sha,
        toSha: parentSha,
        fromX: node.x,
        fromY: node.y,
        toX: parentNode.x,
        toY: parentNode.y,
        isMerge: parentNode.col !== node.col,
        isMain,
        color: isMain ? MAIN_COLOR : laneColor(node.col),
      });
    }
  }

  const totalWidth =
    SIDE_PADDING * 2 + (maxOffset - minOffset) * COL_WIDTH;
  const totalHeight = TOP_MARGIN + nodes.length * ROW_HEIGHT + TOP_MARGIN;

  return { nodes, edges, totalWidth, totalHeight, centerX };
}
