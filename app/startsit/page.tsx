"use client";

import { useState } from "react";

interface StatBlock {
  pts: number;
  reb: number;
  ast: number;
  stl?: number;
  blk?: number;
  fg_pct?: number;
}

interface PlayerResult {
  name: string;
  team: string;
  position: string;
  status: string;
  trend: "hot" | "cold" | "stable";
  season_avg: StatBlock;
  last_14: StatBlock | null;
  last_7: StatBlock | null;
}

interface Recommendation {
  start: PlayerResult;
  sit: PlayerResult;
  confidence: "High" | "Medium" | "Low";
  reasons: string[];
}

const TREND_STYLE = {
  hot: { label: "🔥 Hot Streak", className: "text-orange-400" },
  cold: { label: "❄️ Cold Streak", className: "text-blue-400" },
  stable: { label: "➡️ Stable", className: "text-gray-400" },
};

const CONFIDENCE_STYLE = {
  High: "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low: "bg-gray-700 text-gray-300 border-gray-600",
};

function PlayerCard({ player, label }: { player: PlayerResult; label: "START" | "SIT" }) {
  const isStart = label === "START";
  const stats = player.last_14 ?? player.season_avg;
  const trend = TREND_STYLE[player.trend];

  return (
    <div className={`rounded-2xl border p-6 flex-1 ${
      isStart
        ? "bg-green-500/5 border-green-500/30"
        : "bg-red-500/5 border-red-500/20"
    }`}>
      <div className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-4 ${
        isStart ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
      }`}>
        {label}
      </div>
      <h3 className="text-2xl font-black mb-1">{player.name}</h3>
      <p className="text-gray-400 text-sm mb-1">{player.team} · {player.position}</p>
      <div className="flex items-center gap-3 mb-5">
        <span className={`text-sm font-semibold ${trend.className}`}>{trend.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          player.status === "Active"
            ? "bg-green-500/20 text-green-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}>
          {player.status}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Last 14 Days</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "pts", label: "PTS" },
            { key: "reb", label: "REB" },
            { key: "ast", label: "AST" },
          ].map(({ key, label: l }) => (
            <div key={key} className="bg-gray-900 rounded-lg p-2 text-center">
              <div className="text-xl font-bold">{stats[key as keyof StatBlock]}</div>
              <div className="text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Season Avg</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "pts", label: "PTS" },
            { key: "reb", label: "REB" },
            { key: "ast", label: "AST" },
          ].map(({ key, label: l }) => (
            <div key={key} className="bg-gray-900/60 rounded-lg p-2 text-center">
              <div className="text-lg font-semibold text-gray-300">
                {player.season_avg[key as keyof StatBlock]}
              </div>
              <div className="text-xs text-gray-600">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StartSitPage() {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!player1.trim() || !player2.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `http://localhost:8000/startsit?player1=${encodeURIComponent(player1.trim())}&player2=${encodeURIComponent(player2.trim())}`
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail ?? "One or both players not found. Use full names.");
        return;
      }
      setResult(await res.json());
    } catch {
      setError("Cannot connect to the data server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-orange-500">NBA</span>
            <span className="text-xl font-black text-white">Fantasy Edge</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-gray-400 text-sm">
            <a href="/players" className="hover:text-white transition">Players</a>
            <a href="/startsit" className="text-white font-semibold">Start/Sit</a>
            <a href="/waiver" className="hover:text-white transition">Waiver Wire</a>
            <a href="/injuries" className="hover:text-white transition">Injuries</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-2">Start / Sit</h1>
        <p className="text-gray-400 mb-8">
          Enter two players you&apos;re deciding between. We&apos;ll analyze their recent form,
          trends, and status to tell you who to start.
        </p>

        {/* Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Player 1</label>
            <input
              type="text"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="e.g. LeBron James"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Player 2</label>
            <input
              type="text"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="e.g. Kevin Durant"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-4 rounded-xl text-lg font-bold transition mb-8"
        >
          {loading ? "Analyzing... (fetching live NBA data, ~20 sec)" : "Analyze →"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6">
            {/* Verdict banner */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">Our Recommendation</p>
              <p className="text-3xl font-black mb-1">
                Start <span className="text-green-400">{result.start.name}</span>
              </p>
              <p className="text-gray-500 text-sm mb-4">
                over {result.sit.name}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${CONFIDENCE_STYLE[result.confidence]}`}>
                {result.confidence} Confidence
              </span>
            </div>

            {/* Reasons */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Why?</h3>
              <ul className="space-y-3">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="text-orange-500 mt-0.5 shrink-0">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Side by side cards */}
            <div className="flex flex-col sm:flex-row gap-4">
              <PlayerCard player={result.start} label="START" />
              <PlayerCard player={result.sit} label="SIT" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
