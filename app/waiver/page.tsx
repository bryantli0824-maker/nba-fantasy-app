"use client";

import { useState, useEffect } from "react";

interface WaiverPlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  season_pts: number;
  recent_pts: number;
  recent_reb: number;
  recent_ast: number;
  recent_stl: number;
  pts_diff: number;
  fantasy_score: number;
  trend: "hot" | "cold" | "stable";
  gp: number;
}

const TREND_BADGE: Record<string, string> = {
  hot: "🔥 Trending Up",
  cold: "❄️ Cooling Off",
  stable: "➡️ Consistent",
};

const TREND_COLOR: Record<string, string> = {
  hot: "text-orange-400",
  cold: "text-blue-400",
  stable: "text-gray-400",
};

export default function WaiverPage() {
  const [players, setPlayers] = useState<WaiverPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("http://localhost:8000/waiver")
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    filter === "All" ? players : players.filter((p) => p.trend === filter.toLowerCase());

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
            <a href="/startsit" className="hover:text-white transition">Start/Sit</a>
            <a href="/waiver" className="text-white font-semibold">Waiver Wire</a>
            <a href="/injuries" className="hover:text-white transition">Injuries</a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-2">Waiver Wire</h1>
        <p className="text-gray-400 mb-8">
          Top 30 players ranked by recent fantasy value — sorted by last 15 games performance.
          Hot streaks highlighted.
        </p>

        {loading && (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-2">Loading waiver data from NBA.com...</div>
            <div className="text-gray-600 text-sm">This takes about 10 seconds</div>
          </div>
        )}

        {!loading && (
          <>
            {/* Filter */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {["All", "Hot", "Stable", "Cold"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filter === f
                      ? "bg-orange-500 text-white"
                      : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {f === "Hot" && "🔥 "}
                  {f === "Cold" && "❄️ "}
                  {f}
                </button>
              ))}
              <span className="ml-auto text-gray-600 text-sm self-center">
                {filtered.length} players
              </span>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-4">Player</th>
                      <th className="px-4 py-4 text-center">Trend</th>
                      <th className="px-4 py-4 text-center">L15 PTS</th>
                      <th className="px-4 py-4 text-center">L15 REB</th>
                      <th className="px-4 py-4 text-center">L15 AST</th>
                      <th className="px-4 py-4 text-center">L15 STL</th>
                      <th className="px-4 py-4 text-center">vs Season</th>
                      <th className="px-4 py-4 text-center">Fantasy Score</th>
                      <th className="px-4 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((player, i) => (
                      <tr
                        key={player.id}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition ${
                          player.trend === "hot" ? "border-l-2 border-l-orange-500/40" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600 text-xs w-5">{i + 1}</span>
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-gray-500 text-xs mt-0.5">
                                {player.team} · {player.position}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-semibold ${TREND_COLOR[player.trend]}`}>
                            {TREND_BADGE[player.trend]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-mono font-semibold">
                          {player.recent_pts}
                        </td>
                        <td className="px-4 py-4 text-center font-mono">{player.recent_reb}</td>
                        <td className="px-4 py-4 text-center font-mono">{player.recent_ast}</td>
                        <td className="px-4 py-4 text-center font-mono">{player.recent_stl}</td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`font-mono font-semibold text-xs ${
                              player.pts_diff > 0
                                ? "text-green-400"
                                : player.pts_diff < 0
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}
                          >
                            {player.pts_diff > 0 ? "+" : ""}
                            {player.pts_diff}% FG
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-orange-400 font-mono">
                            {player.fantasy_score}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <a
                            href={`/players?q=${encodeURIComponent(player.name)}`}
                            className="text-orange-400 hover:text-orange-300 text-xs font-semibold transition"
                          >
                            Full Stats →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-center text-gray-700 text-xs mt-4">
              Fantasy Score = PTS + REB×1.2 + AST×1.5 + STL×3 + BLK×3 · Based on last 15 games
            </p>
          </>
        )}
      </div>
    </main>
  );
}
