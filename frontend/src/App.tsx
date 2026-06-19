/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GitService, type CommitNodeData } from "./services/gitService";
import { transformCommitsToGraph } from "./utils/graphTransformer";
import {
  GitBranch,
  RefreshCw,
  Hash,
  Layers,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import ConflictPredictor from "./components/ConflictPredictor";

type ActiveTab = "inspector" | "conflicts";

/* ── Custom commit node card (JSX lives here, not in .ts) ── */
function CommitNode({ data }: { data: any }) {
  return (
    <div className="px-3.5 py-2.5 min-w-[220px] max-w-[260px] relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-green-500 !w-2 !h-2"
      />

      <p className="mono text-[11px] font-semibold text-green-400 tracking-wide mb-1">
        {data.hash}
      </p>
      <p className="text-[12px] font-medium text-slate-200 truncate max-w-[200px]">
        {data.message}
      </p>
      <p className="text-[10px] text-slate-500 mt-1">{data.author}</p>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !w-2 !h-2"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { commitNode: CommitNode };

export default function App() {
  const [commits, setCommits] = useState<CommitNodeData[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedCommit, setSelectedCommit] = useState<CommitNodeData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("inspector");
  const [syncing, setSyncing] = useState(false);

  const loadRepositoryData = async () => {
    setSyncing(true);
    setLoading(true);
    const commitData = await GitService.fetchCommits();
    setCommits(commitData);
    const { nodes: graphNodes, edges: graphEdges } =
      transformCommitsToGraph(commitData);
    setNodes(graphNodes.map((n) => ({ ...n, type: "commitNode" })));
    setEdges(graphEdges);
    setLoading(false);
    setSyncing(false);
  };

  useEffect(() => {
    loadRepositoryData();
  }, []);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      // node.id is now "node-0", "node-1" etc — match via commitId stored in data
      const fullCommit = commits.find((c) => c.id === node.data.commitId);
      if (fullCommit) {
        setSelectedCommit(fullCommit);
        setActiveTab("inspector");
      }
    },
    [commits],
  );

  return (
    <div className="flex h-dvh w-screen bg-[#080C14] font-sans text-slate-100 overflow-hidden">
      {/* ── LEFT: Graph Canvas ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between px-5 bg-[#0D1117]/80 backdrop-blur-md border-b border-[#1E2D40] z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center text-green-400">
              <img src="/logo.png" alt="" className="size-8" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight leading-none">
                Git<span className="text-green-400">Insights</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                Repository Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {commits.length > 0 && (
              <div className="flex items-center gap-1.5 mono text-[11px] text-slate-400 bg-[#161D2B] border border-[#1E2D40] px-3 py-1 rounded-full">
                <Layers size={11} />
                {commits.length} commits
              </div>
            )}
            <button
              onClick={loadRepositoryData}
              disabled={syncing}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-md bg-[#161D2B] border border-[#243447] text-slate-400 hover:text-green-400 hover:border-green-500/40 hover:bg-green-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={13}
                className={syncing ? "animate-spin-slow" : ""}
              />
              {syncing ? "Syncing…" : "Sync"}
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="relative flex-1 bg-[#080C14]">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background color="#1E2D40" gap={24} size={1} />
              <Controls />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-500 text-sm">
              {loading ? (
                <>
                  <div className="h-9 w-9 rounded-full border-2 border-[#1E2D40] border-t-green-500 animate-spin-slow" />
                  <p>Reading repository structure…</p>
                </>
              ) : (
                <>
                  <GitBranch size={30} className="opacity-20" />
                  <p>No repository found on the server engine.</p>
                  <button
                    onClick={loadRepositoryData}
                    className="text-xs px-4 py-2 rounded-md bg-[#161D2B] border border-[#243447] text-slate-400 hover:text-green-400 hover:border-green-500/40 transition-all"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Sidebar ── */}
      <aside className="flex w-[340px] shrink-0 flex-col bg-[#0D1117] border-l border-[#1E2D40] h-dvh z-10">
        {/* Tabs */}
        <div className="flex h-14 shrink-0 items-end gap-0.5 border-b border-[#1E2D40] px-1">
          {(["inspector", "conflicts"] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold capitalize border-b-2 -mb-px transition-all ${
                activeTab === tab
                  ? "text-green-400 border-green-400"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {tab === "inspector" ? <Hash size={12} /> : <Layers size={12} />}
              {tab === "inspector" ? "Inspector" : "Merge Check"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-thin">
          {activeTab === "inspector" &&
            (selectedCommit ? (
              <div className="flex flex-col gap-4 fade-in">
                {/* Author card */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#111827] border border-[#1E2D40]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1a2744] to-purple-900/40 border border-purple-500/20 text-purple-300 text-[15px] font-bold">
                    {selectedCommit.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-100">
                      {selectedCommit.author}
                    </p>
                    <p className="mono text-[10px] text-slate-500 mt-0.5">
                      {selectedCommit.date}
                    </p>
                  </div>
                </div>

                {/* Fields */}
                {[
                  {
                    icon: <MessageSquare size={10} />,
                    label: "Commit Message",
                    value: selectedCommit.message,
                    mono: false,
                  },
                  {
                    icon: <Hash size={10} />,
                    label: "Full SHA",
                    value: selectedCommit.id,
                    mono: true,
                  },
                  {
                    icon: <Clock size={10} />,
                    label: "Timestamp",
                    value: selectedCommit.date,
                    mono: true,
                  },
                  {
                    icon: <User size={10} />,
                    label: "Author",
                    value: selectedCommit.author,
                    mono: false,
                  },
                ].map(({ icon, label, value, mono }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {icon} {label}
                    </label>
                    <p
                      className={`text-[12px] text-slate-200 bg-[#111827] border border-[#1E2D40] rounded-lg px-3 py-2 break-all leading-relaxed ${mono ? "mono text-green-400" : ""}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center pt-12 gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1E2D40] bg-[#111827] text-slate-600">
                  <GitBranch size={22} />
                </div>
                <p className="text-[13px] font-semibold text-slate-400">
                  No commit selected
                </p>
                <p className="text-[12px] text-slate-600 leading-relaxed max-w-[200px]">
                  Click any node in the graph to inspect its metadata.
                </p>
              </div>
            ))}

          {activeTab === "conflicts" && <ConflictPredictor />}
        </div>

        {/* Footer */}
        <footer className="flex items-center gap-2 border-t border-[#1E2D40] px-5 py-3 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          <span className="mono text-[10px] text-white">
            GitInsights Engine <span className="text-green-400">v1.0.2</span>
          </span>
        </footer>
      </aside>
    </div>
  );
}
