"use client";

import { useState } from "react";

interface StatRow {
  gp?: number;
  pts?: number;
  reb?: number;
  ast?: number;
  stl?: number;
  blk?: number;
  fg_pct?: number;
  fg3_pct?: number;
  ft_pct?: number;
  season?: string;
  team?: string;
}

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  jersey: string;
  status: string;
  season_avg: StatRow | null;
  last_season_avg: StatRow | null;
  last_14_avg: StatRow | null;
  last_30_avg: StatRow | null;
  recent_games: Record<string, unknown>[];
}

function StatCard({ label, data }: { label: string; data: StatRow | null }) {
  if (!data) return null;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "pts", label: "PTS" },
          { key: "reb", label: "REB" },
          { key: "ast", label: "AST" },
          { key: "stl", label: "STL" },
          { key: "blk", label: "BLK" },
          { key: "fg_pct", label: "FG%" },
        ].map(({ key, label: statLabel }) =>
          data[key as keyof StatRow] !== undefined ? (
            <div key={key} className="text-center">
              <div className="text-xl font-bold text-white">
                {data[key as keyof StatRow]}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{statLabel}</div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchPlayer() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setPlayer(null);
    try {
      const res = await fetch(
        `https://nba-fantasy-app-production.up.railway.app/player/${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) {
        setError(`Player "${query}" not found. Try their full name (e.g. LeBron James).`);
        return;
      }
      const data = await res.json();
      setPlayer(data);
    } catch {
      setError("Could not connect to the data server. Make sure the backend is running.");
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
            <a href="/players" className="text-white font-semibold">Players</a>
            <a href="#" className="hover:text-white transition">Start/Sit</a>
            <a href="#" className="hover:text-white transition">Waiver Wire</a>
            <a href="#" className="hover:text-white transition">Injuries</a>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-2">Player Stats</h1>
        <p className="text-gray-400 mb-8">
          Search any NBA player to see their season stats, recent form, and trends.
        </p>

        {/* Search Bar */}
        <div className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPlayer()}
            placeholder="Search player (e.g. LeBron James, Nikola Jokic...)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
          <button
            onClick={searchPlayer}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-2">Fetching stats from NBA.com...</div>
            <div className="text-gray-600 text-sm">This takes a few seconds</div>
          </div>
        )}

        {/* Player Results */}
        {player && (
          <div className="space-y-6">
            {/* Player Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-black">{player.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-gray-400">
                    <span className="font-semibold text-white">{player.team}</span>
                    <span>·</span>
                    <span>{player.position}</span>
                    <span>·</span>
                    <span>#{player.jersey}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                    player.status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {player.status}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard label={`${player.season_avg?.season ?? ""} Season Avg`} data={player.season_avg} />
              <StatCard label={`${player.last_season_avg?.season ?? ""} Last Season`} data={player.last_season_avg} />
              <StatCard label="Last 14 Days Avg" data={player.last_14_avg} />
              <StatCard label="Last 30 Days Avg" data={player.last_30_avg} />
            </div>

            {/* Recent Games */}
            {player.recent_games.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="font-bold text-lg">Recent Games</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="text-left px-6 py-3">Date</th>
                        <th className="text-left px-6 py-3">Matchup</th>
                        <th className="px-4 py-3 text-center">W/L</th>
                        <th className="px-4 py-3 text-center">MIN</th>
                        <th className="px-4 py-3 text-center">PTS</th>
                        <th className="px-4 py-3 text-center">REB</th>
                        <th className="px-4 py-3 text-center">AST</th>
                        <th className="px-4 py-3 text-center">STL</th>
                        <th className="px-4 py-3 text-center">BLK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.recent_games.map((g, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                        >
                          <td className="px-6 py-3 text-gray-400">
                            {String(g.GAME_DATE)}
                          </td>
                          <td className="px-6 py-3 font-medium">
                            {String(g.MATCHUP)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-bold ${
                                g.WL === "W" ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {String(g.WL)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">
                            {String(g.MIN)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-orange-400">
                            {String(g.PTS)}
                          </td>
                          <td className="px-4 py-3 text-center">{String(g.REB)}</td>
                          <td className="px-4 py-3 text-center">{String(g.AST)}</td>
                          <td className="px-4 py-3 text-center">{String(g.STL)}</td>
                          <td className="px-4 py-3 text-center">{String(g.BLK)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
