"use client";

import { useState, useEffect } from "react";

interface PlayerStatus {
  id: number;
  name: string;
  team: string;
  position: string;
  status: string;
  pts: number;
  reb: number;
  ast: number;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-500/20 text-green-400 border-green-500/20",
  Inactive: "bg-red-500/20 text-red-400 border-red-500/20",
  Injured: "bg-red-500/20 text-red-400 border-red-500/20",
};

const WATCH_LIST = [
  "LeBron James", "Stephen Curry", "Kevin Durant", "Nikola Jokic",
  "Giannis Antetokounmpo", "Jayson Tatum", "Luka Doncic", "Joel Embiid",
  "Anthony Davis", "Damian Lillard", "Devin Booker", "Ja Morant",
  "Trae Young", "Donovan Mitchell", "Zion Williamson",
];

export default function InjuriesPage() {
  const [players, setPlayers] = useState<PlayerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchAll() {
      const results: PlayerStatus[] = [];
      for (let i = 0; i < WATCH_LIST.length; i++) {
        const name = WATCH_LIST[i];
        try {
          const res = await fetch(
            `https://nba-fantasy-app-production.up.railway.app/player/${encodeURIComponent(name)}`
          );
          if (res.ok) {
            const d = await res.json();
            results.push({
              id: d.id,
              name: d.name,
              team: d.team,
              position: d.position,
              status: d.status || "Active",
              pts: d.season_avg?.pts ?? 0,
              reb: d.season_avg?.reb ?? 0,
              ast: d.season_avg?.ast ?? 0,
            });
            setPlayers([...results]);
          }
        } catch {
          // skip failed lookups
        }
        setProgress(Math.round(((i + 1) / WATCH_LIST.length) * 100));
        await new Promise((r) => setTimeout(r, 200));
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  const filtered =
    filter === "All" ? players : players.filter((p) => p.status === filter);

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
            <a href="/waiver" className="hover:text-white transition">Waiver Wire</a>
            <a href="/injuries" className="text-white font-semibold">Injuries</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-2">Injury & Status Tracker</h1>
        <p className="text-gray-400 mb-8">
          Live roster status for top fantasy-relevant players from NBA.com.
        </p>

        {/* Loading bar */}
        {loading && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Fetching player statuses from NBA.com...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {players.length > 0 && (
              <p className="text-gray-600 text-xs mt-2">
                Loaded {players.length} of {WATCH_LIST.length} players so far...
              </p>
            )}
          </div>
        )}

        {/* Filter buttons */}
        {players.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {["All", "Active", "Inactive", "Injured"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === f
                    ? "bg-orange-500 text-white"
                    : "bg-gray-900 border border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {f}
                {f === "All" && ` (${players.length})`}
                {f !== "All" && ` (${players.filter((p) => p.status === f).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Player list */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4">Player</th>
                  <th className="px-4 py-4 text-center">PTS</th>
                  <th className="px-4 py-4 text-center">REB</th>
                  <th className="px-4 py-4 text-center">AST</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-600">
                      No players match this filter.
                    </td>
                  </tr>
                )}
                {filtered.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {player.team} · {player.position}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono">{player.pts}</td>
                    <td className="px-4 py-4 text-center font-mono">{player.reb}</td>
                    <td className="px-4 py-4 text-center font-mono">{player.ast}</td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          STATUS_COLORS[player.status] ?? "bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                      >
                        {player.status}
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
      </div>
    </main>
  );
}
