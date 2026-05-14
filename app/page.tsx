export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-orange-500">NBA</span>
            <span className="text-2xl font-black text-white">Fantasy Edge</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-gray-400 text-sm">
            <a href="/players" className="hover:text-white transition">Players</a>
            <a href="/startsit" className="hover:text-white transition">Start/Sit</a>
            <a href="/waiver" className="hover:text-white transition">Waiver Wire</a>
            <a href="/injuries" className="hover:text-white transition">Injuries</a>
          </div>
          <a href="/players" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm px-4 py-2 rounded-full mb-6">
            Built for competitive fantasy players
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Win Your <span className="text-orange-500">Fantasy</span> League
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Real-time NBA player stats, injury alerts, start/sit recommendations,
            and waiver wire suggestions — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/players" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition text-center">
              Analyze Players
            </a>
            <a href="/injuries" className="border border-gray-700 hover:border-gray-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition text-center">
              View Injuries
            </a>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "📊", title: "Player Stats", description: "Season avg, last season, last 30 days, and last 14 days for every NBA player.", href: "/players" },
            { icon: "🚨", title: "Injury Alerts", description: "Real-time injury reports and player status updates before lineup lock.", href: "/injuries" },
            { icon: "✅", title: "Start / Sit", description: "AI-powered recommendations on who to start based on matchup and recent form.", href: "/startsit" },
            { icon: "📈", title: "Waiver Wire", description: "Trending pickups ranked by fantasy value so you never miss a breakout player.", href: "/waiver" },
          ].map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/40 transition cursor-pointer block"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Player Stats Preview Table */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Top Players</h2>
            <a href="/players" className="text-orange-400 hover:text-orange-300 text-sm transition">
              Search all players →
            </a>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-4">Player</th>
                    <th className="px-4 py-4 text-center">PTS</th>
                    <th className="px-4 py-4 text-center">REB</th>
                    <th className="px-4 py-4 text-center">AST</th>
                    <th className="px-4 py-4 text-center">L14 PTS</th>
                    <th className="px-4 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "LeBron James", team: "LAL", pts: 25.4, reb: 7.3, ast: 8.1, l14: 27.2, status: "Active" },
                    { name: "Nikola Jokic", team: "DEN", pts: 26.4, reb: 12.3, ast: 9.0, l14: 28.1, status: "Active" },
                    { name: "Jayson Tatum", team: "BOS", pts: 26.9, reb: 8.1, ast: 4.9, l14: 24.3, status: "Questionable" },
                    { name: "Kevin Durant", team: "PHX", pts: 27.1, reb: 6.6, ast: 5.0, l14: 25.8, status: "Active" },
                    { name: "Luka Doncic", team: "DAL", pts: 33.9, reb: 9.2, ast: 9.8, l14: 35.1, status: "Active" },
                  ].map((player) => (
                    <a
                      key={player.name}
                      href={`/players?q=${encodeURIComponent(player.name)}`}
                      className="border-b border-gray-800/50 hover:bg-gray-800/40 transition cursor-pointer table-row"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{player.team}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-mono">{player.pts}</td>
                      <td className="px-4 py-4 text-center font-mono">{player.reb}</td>
                      <td className="px-4 py-4 text-center font-mono">{player.ast}</td>
                      <td className="px-4 py-4 text-center font-mono text-orange-400 font-semibold">{player.l14}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          player.status === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {player.status}
                        </span>
                      </td>
                    </a>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-gray-600 text-sm">
        NBA Fantasy Edge — Built for competitive players
      </footer>
    </main>
  );
}
