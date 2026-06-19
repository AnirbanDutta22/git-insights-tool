import { type Node, type Edge, Position } from "@xyflow/react";
import { type CommitNodeData } from "../services/gitService";

export function transformCommitsToGraph(commits: CommitNodeData[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  commits.forEach((commit, index) => {
    // Use simple index-based IDs — full SHA strings cause React Flow
    // to fail silently when building edge DOM elements
    const nodeId = `node-${index}`;

    nodes.push({
      id: nodeId,
      position: { x: 250, y: index * 110 + 50 },
      // Explicit handle positions are required when using custom node types
      // without these React Flow can't locate where to draw edge endpoints
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: {
        hash: commit.hash,
        message: commit.message,
        author: commit.author,
        commitId: commit.id, // preserve full SHA for the inspector panel
        label: `${commit.hash} · ${commit.message}`,
      },
      style: {
        background: "rgba(13, 17, 23, 0.95)",
        border: "1px solid #1E2D40",
        borderRadius: "10px",
        // Never set padding:0 — React Flow uses the node's padding
        // to size the invisible handle hit areas
        width: 260,
        cursor: "pointer",
      },
    });

    if (index < commits.length - 1) {
      edges.push({
        id: `e-${index}-${index + 1}`,
        source: nodeId,
        target: `node-${index + 1}`,
        // animated: true,
        style: { stroke: "#05df72", strokeWidth: 2, opacity: 0.8 },
      });
    }
  });

  return { nodes, edges };
}
