from datetime import date, datetime, timedelta
import os
from typing import List, Optional
from uuid import UUID
import random
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from sqlalchemy import func, desc



from app.db.database import get_db
from app.models.model import Show, PopularitySnapshot, DailyRanking
from app.schema.schemas import (
    ArenaResponse,
    ArenaShow,
    GameRoundResponse,
    GameVerifyRequest,
    GameVerifyResponse,
    HistoryPoint,
    LeaderboardItem,
    LeaderboardResponse,
    ShowBase,
)
from app.services.twitter_service import fetch_7d_tweet_count

load_dotenv()

CRON_SECRET = "tv_arena_cron_secret_2026"

app = FastAPI(title="TV Arena API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# 1. Leaderboard Endpoint
@app.get("/api/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    limit: int = 50,
    offset: int = 0,
    genre: Optional[str] = None,
    db: Session = Depends(get_db)
):
    latest_date = db.query(func.max(DailyRanking.ranking_date)).scalar() or date.today()

    query = (
    db.query(DailyRanking)
    .join(Show, DailyRanking.show_id == Show.id)
    .filter(DailyRanking.ranking_date == latest_date)
)
    

    if genre:
        clean_genre = genre.strip()
        # Converts the genre array to a comma-separated string and does a case-insensitive LIKE search
        query = query.filter(
            func.array_to_string(Show.genres, ',').ilike(f"%{clean_genre}%")
        )

    total = query.count()
    records = query.order_by(DailyRanking.rank.asc()).offset(offset).limit(limit).all()

    items = [
        LeaderboardItem(
            rank=r.rank,
            rank_change=r.rank_change,
            tweet_count_7d=r.tweet_count_7d,
            show=ShowBase.model_validate(r.show)
        )
        for r in records
    ]

    return LeaderboardResponse(date=latest_date, total=total, data=items)


# 2. Show Search 
@app.get("/api/shows/search", response_model=List[ShowBase])
def search_shows(q: str = Query(..., min_length=1), limit: int = 10, db: Session = Depends(get_db)):
    shows = (
        db.query(Show)
        .filter(Show.title.ilike(f"%{q}%"))
        .limit(limit)
        .all()
    )
    return [ShowBase.model_validate(s) for s in shows]

# 3. Head-to-Head Arena Endpoint
# ==========================================
# 3. HEAD-TO-HEAD ARENA COMPARISON
# ==========================================
@app.get("/api/arena/compare", response_model=ArenaResponse)
def compare_shows(
    slugs: str = Query(..., description="Comma-separated show slugs (e.g. 'stranger-things,the-bear')"),
    db: Session = Depends(get_db)
):
    # Parse and clean slugs
    slug_list = [s.strip().lower() for s in slugs.split(",") if s.strip()]
    if len(slug_list) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 slugs to compare.")

    shows = db.query(Show).filter(Show.slug.in_(slug_list)).all()
    if not shows:
        raise HTTPException(status_code=404, detail="No matching shows found.")

    arena_items = []
    total_tweets = 0

    for s in shows:
        latest_snapshot = (
            db.query(PopularitySnapshot)
            .filter(PopularitySnapshot.show_id == s.id)
            .order_by(desc(PopularitySnapshot.captured_at))
            .first()
        )
        count = latest_snapshot.tweet_count_7d if latest_snapshot else 0
        total_tweets += count

        arena_items.append({
            "id": str(s.id),
            "title": s.title,
            "slug": s.slug,
            "poster_url": s.poster_url,
            "tweet_count_7d": count,
        })

    # Guard against ZeroDivisionError
    for item in arena_items:
        if total_tweets > 0:
            item["share_ratio"] = round((item["tweet_count_7d"] / total_tweets) * 100, 1)
        else:
            item["share_ratio"] = round(100.0 / len(arena_items), 1)

    return ArenaResponse(shows=[ArenaShow(**item) for item in arena_items])
        

# 4. Historical Trends Chart
@app.get("/api/shows/{slug}/history", response_model=List[HistoryPoint])
def get_show_history(slug: str, db: Session = Depends(get_db)):
    show = db.query(Show).filter(Show.slug == slug).first()
    if not show :
        raise HTTPException(status_code=404, detail="Show not found.")
    since_date = datetime.utcnow() - timedelta(days=30)
    snapshot = (
        db.query(PopularitySnapshot)
        .filter(PopularitySnapshot.show_id == show.id, PopularitySnapshot.captured_at >= since_date)
        .order_by(PopularitySnapshot.captured_at.asc())
        .all()
    )
    return [HistoryPoint.model_validate(s) for s in snapshot]


# 5. Higher or Lower Game Endpoints
@app.get("/api/game/round", response_model=GameRoundResponse)
def get_game_round(db: Session = Depends(get_db)):
    shows = db.query(Show).join(PopularitySnapshot).distinct().all()
    if len(shows) < 2:
        raise HTTPException(status_code=400, detail="Not enough shows available for a game round.")
    
    s1, s2 = random.sample(shows, 2)
    s1_snap = db.query(PopularitySnapshot).filter(PopularitySnapshot.show_id == s1.id).order_by(desc(PopularitySnapshot.captured_at)).first()

    return GameRoundResponse(
        revealed_show = {
            "id" : s1.id,
            "title" : s1.title,
            "poster_url" : s1.poster_url,
            "tweet_count_7d" : s1_snap.tweet_count_7d if s1_snap else 0
        },
        challenger_show = {
            "id" : s2.id,
            "title" : s2.title,
            "poster_url" : s2.poster_url
        }
    )

# 6. Game Verification Endpoint
@app.post("/api/game/verify", response_model=GameVerifyResponse)
def verify_game_guess(payload: GameVerifyRequest, db: Session = Depends(get_db)):
    s1_snap = db.query(PopularitySnapshot).filter(PopularitySnapshot.show_id == payload.revealed_show_id).order_by(desc(PopularitySnapshot.captured_at)).first()
    s2_snap = db.query(PopularitySnapshot).filter(PopularitySnapshot.show_id == payload.challenger_show_id).order_by(desc(PopularitySnapshot.captured_at)).first()

    if not s1_snap or not s2_snap:
        raise HTTPException(status_code=404, default="One or both shows not found or have no snapshots.")
    
    rev_count = s1_snap.tweet_count_7d if s1_snap else 0
    chal_count = s2_snap.tweet_count_7d if s2_snap else 0

    if payload.guess.lower() == "higher":
        correct = chal_count > rev_count
    else: 
        correct = chal_count < rev_count

    return GameVerifyResponse(
        correct = correct,
        revealed_count = rev_count,
        challenger_count = chal_count
    )
        
#7. cron sync-metrics
@app.post("/api/cron/sync-metrics")
def run_midnight_sync(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized access. Missing Authorization header."
        )

    # Remove 'Bearer', quotes, and leading/trailing whitespace
    token = authorization.replace("Bearer", "").strip().strip('"').strip("'")

    if token != CRON_SECRET:
        raise HTTPException(
            status_code=401,
            detail=f"Unauthorized access. Expected: {CRON_SECRET!r}, Received: {token!r}"
        )

    today = date.today()
    yesterday = today - timedelta(days=1)
    shows = db.query(Show).all()

    if not shows:
        return {"status": "skipped", "message": "No shows found in database"}

    results = []

    # 1. Fetch counts & record snapshots
    for show in shows:
        count = fetch_7d_tweet_count(show.title, show.search_keywords)

        snapshot = PopularitySnapshot(
            show_id=show.id,
            tweet_count_7d=count
        )
        db.add(snapshot)
        results.append({"show_id": show.id, "count": count})

        time.sleep(0.05)  # Quick throttle

    db.commit()

    # 2. Sort descending to rank shows
    results.sort(key=lambda x: x["count"], reverse=True)

    # 3. Get yesterday's ranks for delta
    yesterday_ranks = {
        r.show_id: r.rank
        for r in db.query(DailyRanking).filter(DailyRanking.ranking_date == yesterday).all()
    }

    # 4. Upsert today's rankings
    for current_rank, item in enumerate(results, start=1):
        prev_rank = yesterday_ranks.get(item["show_id"])
        rank_change = (prev_rank - current_rank) if prev_rank is not None else 0

        ranking_entry = (
            db.query(DailyRanking)
            .filter(
                DailyRanking.ranking_date == today,
                DailyRanking.show_id == item["show_id"]
            )
            .first()
        )

        if ranking_entry:
            ranking_entry.rank = current_rank
            ranking_entry.tweet_count_7d = item["count"]
            ranking_entry.rank_change = rank_change
        else:
            ranking_entry = DailyRanking(
                show_id=item["show_id"],
                ranking_date=today,
                rank=current_rank,
                tweet_count_7d=item["count"],
                rank_change=rank_change
            )
            db.add(ranking_entry)

    db.commit()

    return {
        "status": "success",
        "date": str(today),
        "synced_shows_count": len(results)
    }


    