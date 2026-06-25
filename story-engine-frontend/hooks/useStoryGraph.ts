"use client";

import { useState, useCallback, useMemo } from "react";
import type { StoryGraph, StoryNode } from "@/lib/types";

interface UseStoryGraphReturn {
  currentNode: StoryNode | null;
  currentNodeId: string;
  visitedPath: string[];
  depth: number;
  maxDepth: number;
  makeChoice: (nextNodeId: string) => void;
  reset: () => void;
}

export function useStoryGraph(graph: StoryGraph): UseStoryGraphReturn {
  const firstNodeId = graph.nodes[0]?.node_id ?? "";
  const [currentNodeId, setCurrentNodeId] = useState<string>(firstNodeId);
  const [visitedPath, setVisitedPath] = useState<string[]>([firstNodeId]);

  const currentNode = useMemo(
    () => graph.nodes.find((n) => n.node_id === currentNodeId) ?? null,
    [graph.nodes, currentNodeId]
  );

  // Max depth = number of scene nodes (decision points) + 1 for the branch
  const maxDepth = useMemo(() => {
    const sceneCount = graph.nodes.filter((n) => n.type === "scene").length;
    return sceneCount + 1;
  }, [graph.nodes]);

  const depth = visitedPath.length;

  const makeChoice = useCallback((nextNodeId: string) => {
    setCurrentNodeId(nextNodeId);
    setVisitedPath((prev) => [...prev, nextNodeId]);
  }, []);

  const reset = useCallback(() => {
    setCurrentNodeId(firstNodeId);
    setVisitedPath([firstNodeId]);
  }, [firstNodeId]);

  return { currentNode, currentNodeId, visitedPath, depth, maxDepth, makeChoice, reset };
}
