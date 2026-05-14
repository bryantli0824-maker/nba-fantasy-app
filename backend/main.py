from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nba_api.stats.endpoints import playercareerstats, commonplayerinfo, leaguedashplayerstats, playergamelog
from nba_api.stats.static import players
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def find_player(name: str):
    results = players.find_players_by_full_name(name)
    if not results:
        raise HTTPException(status_code=404, detail=f"Player '{name}' not found")
    return results[0]


@app.get("/")
def root():
    return {"message": "NBA Fantasy Edge API is running"}


@app.get("/player/{player_name}")
def get_player_stats(player_name: str):
    player = find_player(player_name)
    player_id = player["id"]

    time.sleep(0.6)
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    info_data = info.get_normalized_dict()["CommonPlayerInfo"][0]

    time.sleep(0.6)
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    career_data = career.get_normalized_dict()["SeasonTotalsRegularSeason"]

    current_season = None
    last_season = None
    if len(career_data) >= 1:
        current_season = career_data[-1]
    if len(career_data) >= 2:
        last_season = career_data[-2]

    def calc_avgs(season):
        if not season or season.get("GP", 0) == 0:
            return None
        gp = season["GP"]
        return {
            "season": season.get("SEASON_ID"),
            "team": season.get("TEAM_ABBREVIATION"),
            "gp": gp,
            "pts": round(season.get("PTS", 0) / gp, 1),
            "reb": round(season.get("REB", 0) / gp, 1),
            "ast": round(season.get("AST", 0) / gp, 1),
            "stl": round(season.get("STL", 0) / gp, 1),
            "blk": round(season.get("BLK", 0) / gp, 1),
            "fg_pct": round((season.get("FG_PCT") or 0) * 100, 1),
            "fg3_pct": round((season.get("FG3_PCT") or 0) * 100, 1),
            "ft_pct": round((season.get("FT_PCT") or 0) * 100, 1),
        }

    time.sleep(0.6)
    gamelog = playergamelog.PlayerGameLog(player_id=player_id, season="2024-25")
    games = gamelog.get_normalized_dict()["PlayerGameLog"]

    def avg_last_n(games, n):
        subset = games[:n]
        if not subset:
            return None
        gp = len(subset)
        return {
            "gp": gp,
            "pts": round(sum(g["PTS"] for g in subset) / gp, 1),
            "reb": round(sum(g["REB"] for g in subset) / gp, 1),
            "ast": round(sum(g["AST"] for g in subset) / gp, 1),
            "stl": round(sum(g["STL"] for g in subset) / gp, 1),
            "blk": round(sum(g["BLK"] for g in subset) / gp, 1),
        }

    return {
        "id": player_id,
        "name": info_data.get("DISPLAY_FIRST_LAST"),
        "team": info_data.get("TEAM_ABBREVIATION"),
        "position": info_data.get("POSITION"),
        "jersey": info_data.get("JERSEY"),
        "status": info_data.get("ROSTERSTATUS"),
        "season_avg": calc_avgs(current_season),
        "last_season_avg": calc_avgs(last_season),
        "last_14_avg": avg_last_n(games, 14),
        "last_30_avg": avg_last_n(games, 30),
        "recent_games": games[:5],
    }


@app.get("/startsit")
def start_sit(player1: str, player2: str):
    def fetch(name: str):
        p = find_player(name)
        pid = p["id"]
        time.sleep(0.6)
        info = commonplayerinfo.CommonPlayerInfo(player_id=pid).get_normalized_dict()["CommonPlayerInfo"][0]
        time.sleep(0.6)
        games = playergamelog.PlayerGameLog(player_id=pid, season="2024-25").get_normalized_dict()["PlayerGameLog"]
        time.sleep(0.6)
        career = playercareerstats.PlayerCareerStats(player_id=pid).get_normalized_dict()["SeasonTotalsRegularSeason"]

        season = career[-1] if career else {}
        gp = season.get("GP", 1) or 1

        def avg_n(n):
            s = games[:n]
            if not s:
                return None
            g = len(s)
            return {
                "pts": round(sum(x["PTS"] for x in s) / g, 1),
                "reb": round(sum(x["REB"] for x in s) / g, 1),
                "ast": round(sum(x["AST"] for x in s) / g, 1),
                "stl": round(sum(x["STL"] for x in s) / g, 1),
                "blk": round(sum(x["BLK"] for x in s) / g, 1),
            }

        return {
            "name": info.get("DISPLAY_FIRST_LAST"),
            "team": info.get("TEAM_ABBREVIATION"),
            "position": info.get("POSITION"),
            "status": info.get("ROSTERSTATUS", "Active"),
            "season_avg": {
                "pts": round(season.get("PTS", 0) / gp, 1),
                "reb": round(season.get("REB", 0) / gp, 1),
                "ast": round(season.get("AST", 0) / gp, 1),
                "fg_pct": round((season.get("FG_PCT") or 0) * 100, 1),
            },
            "last_14": avg_n(14),
            "last_7": avg_n(7),
        }

    p1 = fetch(player1)
    p2 = fetch(player2)

    # Score each player across key categories
    def score(p: dict) -> float:
        l14 = p.get("last_14") or p["season_avg"]
        s = p["season_avg"]
        status_bonus = 5 if p["status"] == "Active" else -10
        trend_bonus = (l14["pts"] - s["pts"]) * 0.5  # reward hot streaks
        return l14["pts"] + l14["reb"] * 0.5 + l14["ast"] * 0.5 + status_bonus + trend_bonus

    s1, s2 = score(p1), score(p2)

    def trend(p: dict) -> str:
        l14 = p.get("last_14")
        if not l14:
            return "stable"
        diff = l14["pts"] - p["season_avg"]["pts"]
        if diff >= 3:
            return "hot"
        if diff <= -3:
            return "cold"
        return "stable"

    def build_reasons(starter: dict, bencher: dict) -> list[str]:
        reasons = []
        l14s = starter.get("last_14") or starter["season_avg"]
        l14b = bencher.get("last_14") or bencher["season_avg"]
        if l14s["pts"] > l14b["pts"]:
            reasons.append(f"Averaging {l14s['pts']} PPG vs {l14b['pts']} PPG over the last 14 days")
        if starter["status"] == "Active" and bencher["status"] != "Active":
            reasons.append(f"{bencher['name']} has an uncertain roster status — risky start")
        t = trend(starter)
        if t == "hot":
            reasons.append(f"{starter['name']} is on a hot streak — scoring above their season average lately")
        if l14s["reb"] > l14b["reb"]:
            reasons.append(f"Better rebounding recently ({l14s['reb']} vs {l14b['reb']} RPG)")
        if l14s["ast"] > l14b["ast"]:
            reasons.append(f"More assists recently ({l14s['ast']} vs {l14b['ast']} APG)")
        return reasons[:3]

    if s1 >= s2:
        start, sit = p1, p2
    else:
        start, sit = p2, p1

    return {
        "start": {**start, "trend": trend(start)},
        "sit": {**sit, "trend": trend(sit)},
        "confidence": "High" if abs(s1 - s2) > 8 else "Medium" if abs(s1 - s2) > 3 else "Low",
        "reasons": build_reasons(start, sit),
    }


@app.get("/players/top")
def get_top_players():
    time.sleep(0.6)
    stats = leaguedashplayerstats.LeagueDashPlayerStats(
        season="2024-25",
        per_mode_simple="PerGame",
    )
    data = stats.get_normalized_dict()["LeagueDashPlayerStats"]
    top = sorted(data, key=lambda x: x.get("PTS", 0), reverse=True)[:20]

    return [
        {
            "id": p["PLAYER_ID"],
            "name": p["PLAYER_NAME"],
            "team": p["TEAM_ABBREVIATION"],
            "gp": p.get("GP"),
            "pts": p.get("PTS"),
            "reb": p.get("REB"),
            "ast": p.get("AST"),
            "stl": p.get("STL"),
            "blk": p.get("BLK"),
            "fg_pct": round((p.get("FG_PCT") or 0) * 100, 1),
        }
        for p in top
    ]


@app.get("/waiver")
def get_waiver_wire():
    time.sleep(0.6)
    season_stats = leaguedashplayerstats.LeagueDashPlayerStats(
        season="2024-25",
        per_mode_simple="PerGame",
    )
    season_data = {
        p["PLAYER_ID"]: p
        for p in season_stats.get_normalized_dict()["LeagueDashPlayerStats"]
    }

    time.sleep(0.6)
    last15_stats = leaguedashplayerstats.LeagueDashPlayerStats(
        season="2024-25",
        per_mode_simple="PerGame",
        last_n_games=15,
    )
    last15_data = last15_stats.get_normalized_dict()["LeagueDashPlayerStats"]

    results = []
    for p in last15_data:
        pid = p["PLAYER_ID"]
        season = season_data.get(pid)
        if not season:
            continue

        season_pts = season.get("PTS") or 0
        recent_pts = p.get("PTS") or 0
        season_gp = season.get("GP") or 0

        if season_gp < 10:
            continue

        pts_diff = round(recent_pts - season_pts, 1)
        fantasy_score = round(
            recent_pts
            + (p.get("REB") or 0) * 1.2
            + (p.get("AST") or 0) * 1.5
            + (p.get("STL") or 0) * 3
            + (p.get("BLK") or 0) * 3,
            1,
        )

        if pts_diff >= 2:
            trend = "hot"
        elif pts_diff <= -2:
            trend = "cold"
        else:
            trend = "stable"

        results.append({
            "id": pid,
            "name": p["PLAYER_NAME"],
            "team": p["TEAM_ABBREVIATION"],
            "position": season.get("PLAYER_POSITION", ""),
            "season_pts": season_pts,
            "recent_pts": round(recent_pts, 1),
            "recent_reb": round(p.get("REB") or 0, 1),
            "recent_ast": round(p.get("AST") or 0, 1),
            "recent_stl": round(p.get("STL") or 0, 1),
            "pts_diff": pts_diff,
            "fantasy_score": fantasy_score,
            "trend": trend,
            "gp": season_gp,
        })

    results.sort(key=lambda x: x["fantasy_score"], reverse=True)
    return results[:30]
