"use client";

import { useState, useCallback } from "react";
import {
  BRANCH_COLOR,
  COMMIT_TYPE_COLORS,
  MAIN_COLOR,
  NODE_RADIUS,
  laneColor,
  type CommitType,
  type GraphEdge,
  type GraphLayout,
  type GraphNode,
} from "@/lib/graph";

interface Props {
  layout: GraphLayout;
  owner: string;
  repo: string;
}

function edgePath(edge: GraphEdge): string {
  if (!edge.isMerge) {
    return `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`;
  }
  const midY = (edge.fromY + edge.toY) / 2;
  return `M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TYPE_LABELS: Record<CommitType, string> = {
  feat: "feature",
  fix: "fix",
  docs: "docs",
  refactor: "refactor",
  test: "test",
  chore: "chore",
  merge: "merge",
  other: "other",
};

interface TooltipState {
  node: GraphNode;
  clientX: number;
  clientY: number;
}

function Tooltip({ tooltip }: { tooltip: TooltipState }) {
  const { node, clientX, clientY } = tooltip;
  const color = COMMIT_TYPE_COLORS[node.commitType];

  const style: React.CSSProperties = {
    position: "fixed",
    top: clientY - 12,
    left: clientX + 20,
    zIndex: 50,
    pointerEvents: "none",
    maxWidth: 320,
  };

  return (
    <div style={style}>
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <span
          className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: color + "22", color }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: color }}
          />
          {TYPE_LABELS[node.commitType]}
        </span>

        <p className="mb-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
          {node.message}
        </p>

        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{node.authorName}</span>
          <span>{formatDate(node.date)}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {node.shortSha}
          </code>
          {node.branchNames.map((name) => (
            <span
              key={name}
              className="rounded px-1.5 py-0.5 font-mono text-xs"
              style={{
                background: laneColor(node.col) + "22",
                color: laneColor(node.col),
              }}
            >
              {name}
            </span>
          ))}
        </div>

        <p className="mt-2.5 text-xs text-zinc-400 dark:text-zinc-500">
          Click to view details →
        </p>
      </div>
    </div>
  );
}

const LEGEND_ENTRIES: [CommitType, string][] = [
  ["feat", "feature"],
  ["fix", "fix"],
  ["docs", "docs"],
  ["refactor", "refactor"],
  ["test", "test"],
  ["chore", "chore"],
  ["merge", "merge"],
  ["other", "other"],
];

export default function CommitGraph({ layout, owner, repo }: Props) {
  const { nodes, edges, totalWidth, totalHeight } = layout;
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleEnter = useCallback((node: GraphNode, e: React.MouseEvent) => {
    setTooltip({ node, clientX: e.clientX, clientY: e.clientY });
  }, []);

  const handleMove = useCallback((node: GraphNode, e: React.MouseEvent) => {
    setTooltip((prev) =>
      prev?.node.sha === node.sha
        ? { node, clientX: e.clientX, clientY: e.clientY }
        : prev,
    );
  }, []);

  const handleLeave = useCallback(() => setTooltip(null), []);

  if (nodes.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No commits to display.
      </p>
    );
  }

  return (
    <div>
      <div
        className="w-full overflow-auto rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
        style={{ maxHeight: "75vh" }}
      >
        <div className="flex min-w-fit justify-center">
          <svg width={totalWidth} height={totalHeight} style={{ display: "block" }}>
            {/* Edges — main trunk drawn last so it sits on top */}
            <g>
              {edges
                .filter((e) => !e.isMain)
                .map((edge) => (
                  <path
                    key={`${edge.fromSha}-${edge.toSha}`}
                    d={edgePath(edge)}
                    stroke={edge.color}
                    strokeWidth={2}
                    fill="none"
                    strokeOpacity={0.55}
                  />
                ))}
              {edges
                .filter((e) => e.isMain)
                .map((edge) => (
                  <path
                    key={`${edge.fromSha}-${edge.toSha}`}
                    d={edgePath(edge)}
                    stroke={edge.color}
                    strokeWidth={3.5}
                    fill="none"
                    strokeOpacity={0.95}
                    strokeLinecap="round"
                  />
                ))}
            </g>

            {/* Nodes */}
            <g>
              {nodes.map((node) => {
                const isHovered = tooltip?.node.sha === node.sha;
                const r = isHovered ? NODE_RADIUS + 3 : NODE_RADIUS;
                return (
                  <a
                    key={node.sha}
                    href={`/${owner}/${repo}/${node.sha}`}
                    onMouseEnter={(e) => handleEnter(node, e)}
                    onMouseMove={(e) => handleMove(node, e)}
                    onMouseLeave={handleLeave}
                  >
                    {/* Halo ring on the main trunk nodes */}
                    {node.isMain && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={NODE_RADIUS + 3}
                        fill="none"
                        stroke={MAIN_COLOR}
                        strokeWidth={1.5}
                        strokeOpacity={0.4}
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={COMMIT_TYPE_COLORS[node.commitType]}
                      stroke="var(--graph-node-stroke)"
                      strokeWidth={2}
                      className="cursor-pointer"
                    />
                    {node.branchNames.length > 0 && (
                      <circle
                        cx={node.x + NODE_RADIUS + 3}
                        cy={node.y - NODE_RADIUS - 1}
                        r={3}
                        fill={laneColor(node.col)}
                        opacity={0.9}
                      />
                    )}
                  </a>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-col items-center gap-3">
        {/* Lines encode structure: the trunk vs. every other branch. */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-400 dark:text-zinc-500">
            Lines
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-1 w-6 rounded-full"
              style={{ background: MAIN_COLOR }}
            />
            main branch
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-1 w-6 rounded-full"
              style={{ background: BRANCH_COLOR }}
            />
            other branches
          </span>
        </div>

        {/* Dots encode the type of each commit. */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-400 dark:text-zinc-500">
            Commit type
          </span>
          {LEGEND_ENTRIES.map(([type, label]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: COMMIT_TYPE_COLORS[type] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {tooltip && <Tooltip tooltip={tooltip} />}
    </div>
  );
}
