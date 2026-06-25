"use client";

import type { StoryGraph, StoryNode } from "@/lib/types";

interface StoryMapProps {
  graph: StoryGraph;
  visitedPath: string[];
}

const NODE_W = 180;
const NODE_H = 72;
const H_GAP = 32;
const V_GAP = 96;

function buildLayout(nodes: StoryNode[]) {
  // Group nodes by level
  // Level 0: first scene node
  // Level 1: scene nodes + their branch pairs
  // Derive parent map from choices
  const parentOf: Record<string, string> = {};
  for (const node of nodes) {
    for (const c of node.choices) {
      parentOf[c.next_node] = node.node_id;
    }
  }

  // BFS level assignment
  const levels: Record<string, number> = {};
  const queue = [nodes[0].node_id];
  levels[nodes[0].node_id] = 0;
  while (queue.length) {
    const id = queue.shift()!;
    const node = nodes.find((n) => n.node_id === id)!;
    for (const c of node.choices) {
      if (!(c.next_node in levels)) {
        levels[c.next_node] = levels[id] + 1;
        queue.push(c.next_node);
      }
    }
  }

  // Group by level
  const byLevel: Record<number, string[]> = {};
  for (const [id, lvl] of Object.entries(levels)) {
    byLevel[lvl] = byLevel[lvl] ?? [];
    byLevel[lvl].push(id);
  }

  // Compute x/y positions
  const positions: Record<string, { x: number; y: number }> = {};
  const maxPerLevel = Math.max(...Object.values(byLevel).map((a) => a.length));
  const totalW = maxPerLevel * (NODE_W + H_GAP) - H_GAP;

  for (const [lvlStr, ids] of Object.entries(byLevel)) {
    const lvl = Number(lvlStr);
    const rowW = ids.length * (NODE_W + H_GAP) - H_GAP;
    const startX = (totalW - rowW) / 2;
    ids.forEach((id, i) => {
      positions[id] = {
        x: startX + i * (NODE_W + H_GAP),
        y: lvl * (NODE_H + V_GAP),
      };
    });
  }

  const svgH = (Math.max(...Object.values(levels)) + 1) * (NODE_H + V_GAP);
  return { positions, totalW, svgH, parentOf };
}

export default function StoryMap({ graph, visitedPath }: StoryMapProps) {
  const { positions, totalW, svgH, parentOf } = buildLayout(graph.nodes);
  const visitedSet = new Set(visitedPath);

  const edges: { x1: number; y1: number; x2: number; y2: number; visited: boolean }[] = [];
  for (const node of graph.nodes) {
    const from = positions[node.node_id];
    if (!from) continue;
    for (const c of node.choices) {
      const to = positions[c.next_node];
      if (!to) continue;
      const visited = visitedSet.has(node.node_id) && visitedSet.has(c.next_node);
      edges.push({
        x1: from.x + NODE_W / 2,
        y1: from.y + NODE_H,
        x2: to.x + NODE_W / 2,
        y2: to.y,
        visited,
      });
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <svg
        width={totalW + 40}
        height={svgH + 40}
        viewBox={`-20 -20 ${totalW + 40} ${svgH + 40}`}
        className="mx-auto"
      >
        {/* Edges */}
        {edges.map((e, i) => (
          <path
            key={i}
            d={`M${e.x1},${e.y1} C${e.x1},${e.y1 + V_GAP / 2} ${e.x2},${e.y2 - V_GAP / 2} ${e.x2},${e.y2}`}
            stroke={e.visited ? "#f59e0b" : "#374151"}
            strokeWidth={e.visited ? 2 : 1.5}
            fill="none"
            strokeDasharray={e.visited ? "none" : "4 3"}
          />
        ))}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const pos = positions[node.node_id];
          if (!pos) return null;
          const isVisited = visitedSet.has(node.node_id);
          const isRoot = node.node_id === graph.nodes[0].node_id;
          const isLeaf = node.choices.length === 0;
          const borderColor = isRoot
            ? "#a78bfa"
            : isLeaf
            ? "#10b981"
            : isVisited
            ? "#f59e0b"
            : "#374151";

          return (
            <g key={node.node_id} transform={`translate(${pos.x},${pos.y})`}>
              {/* Glow for leaves */}
              {isLeaf && (
                <rect
                  x="-4" y="-4"
                  width={NODE_W + 8} height={NODE_H + 8}
                  rx="14" fill="#10b981" opacity="0.08"
                />
              )}
              <rect
                width={NODE_W} height={NODE_H}
                rx="10"
                fill="#1a1a1a"
                stroke={borderColor}
                strokeWidth={isVisited || isRoot ? 2 : 1}
              />
              {/* Node type badge */}
              <rect
                x="10" y="8"
                width={node.type === "scene" ? 36 : 44}
                height={14}
                rx="4"
                fill={isRoot ? "#7c3aed22" : node.type === "branch" ? "#05966922" : "#92400e22"}
              />
              <text x="18" y="19" fontSize="8" fill={isRoot ? "#a78bfa" : node.type === "branch" ? "#10b981" : "#f59e0b"} fontFamily="sans-serif">
                {isRoot ? "START" : node.type.toUpperCase()}
              </text>
              {/* Preview text */}
              <text
                x="10" y="42"
                fontSize="10"
                fill={isVisited ? "#e5e7eb" : "#6b7280"}
                fontFamily="Georgia, serif"
              >
                {node.text.slice(0, 26)}{node.text.length > 26 ? "…" : ""}
              </text>
              <text
                x="10" y="58"
                fontSize="10"
                fill={isVisited ? "#9ca3af" : "#4b5563"}
                fontFamily="Georgia, serif"
              >
                {node.text.slice(26, 50)}{node.text.length > 50 ? "…" : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
