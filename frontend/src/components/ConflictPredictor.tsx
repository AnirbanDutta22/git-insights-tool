/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { GitService } from "../services/gitService";
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  GitMerge,
} from "lucide-react";

export default function ConflictPredictor() {
  const [branches, setBranches] = useState<string[]>([]);
  const [targetBranch, setTargetBranch] = useState("");
  const [sourceBranch, setSourceBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    conflictsFound: boolean;
    details: any[];
  } | null>(null);

  useEffect(() => {
    GitService.fetchBranches().then((data) => {
      setBranches(data);
      if (data.length > 0) {
        setTargetBranch(data[0]);
        setSourceBranch(data[1] || data[0]);
      }
    });
  }, []);

  const handlePredict = async () => {
    if (targetBranch === sourceBranch)
      return alert("Please select two different branches.");
    setLoading(true);
    setResult(null);
    const analysis = await GitService.checkConflicts(
      targetBranch,
      sourceBranch,
    );
    setResult(analysis);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-amber-400 text-[12px] font-bold uppercase tracking-widest">
        <ShieldAlert size={14} />
        Pre-Merge Check
      </div>

      {/* Branch selectors */}
      <div className="flex items-end gap-2">
        {[
          { label: "Merge into", value: targetBranch, set: setTargetBranch },
          { label: "Pull from", value: sourceBranch, set: setSourceBranch },
        ].map(({ label, value, set }, i) => (
          <div
            key={label}
            className={`flex flex-col gap-1.5 ${i === 0 ? "flex-1" : "flex-1"}`}
          >
            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {label}
            </label>
            <div className="relative">
              <select
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full appearance-none bg-[#111827] border border-[#243447] rounded-lg px-3 py-2 mono text-[12px] text-slate-200 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 cursor-pointer transition-all"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="currentColor"
                >
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </span>
            </div>
            {i === 0 && <div className="absolute" />}
          </div>
        ))}
      </div>

      <div className="hidden"></div>

      {/* Predict button */}
      <button
        onClick={handlePredict}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500/25 bg-gradient-to-r from-green-500/10 to-purple-500/10 px-4 py-2.5 text-[12px] font-bold text-green-400 transition-all hover:from-green-500/20 hover:to-purple-500/20 hover:border-green-500/50 hover:shadow-[0_0_18px_rgba(79,142,247,0.12)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <span className="h-3 w-3 rounded-full border-2 border-slate-600 border-t-green-400 animate-spin-slow" />
            Simulating merge…
          </>
        ) : (
          <>
            <GitMerge size={13} />
            Predict Conflicts
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-3 fade-in">
          {result.conflictsFound ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/7 px-3.5 py-2.5 text-[12px] font-semibold text-red-400">
                <AlertTriangle size={13} />
                {result.details.length} conflict
                {result.details.length !== 1 ? "s" : ""} detected
              </div>

              {result.details.map((conflict, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-lg border border-[#1E2D40] bg-[#111827]"
                >
                  <div className="flex items-center gap-2 border-b border-[#1E2D40] bg-black/20 px-3 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span className="mono text-[11px] font-medium text-slate-400 truncate">
                      {conflict.file}
                    </span>
                  </div>
                  <pre className="mono p-3 text-[10.5px] leading-relaxed text-yellow-200/80 bg-red-500/4 overflow-x-auto whitespace-pre-wrap break-words">
                    {conflict.content}
                  </pre>
                </div>
              ))}
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/7 px-3.5 py-2.5 text-[12px] font-semibold text-emerald-400">
              <CheckCircle size={13} />
              Clean merge — no conflicts found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
