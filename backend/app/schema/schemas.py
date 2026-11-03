from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

class ShowBase(BaseModel):
    id: UUID
    title: str
    slug: str
    poster_url: Optional[str] = None
    genres: List[str] = []

    class Config:
        from_attributes = True

class LeaderboardItem(BaseModel):
    rank: int
    rank_change: int
    tweet_count_7d: int
    show: ShowBase

class LeaderboardResponse(BaseModel):
    date: date
    total: int
    data: List[LeaderboardItem]

class ArenaShow(BaseModel):
    id: UUID
    title: str
    slug: str
    poster_url: Optional[str]
    tweet_count_7d: int
    share_ratio: float

class ArenaResponse(BaseModel):
    shows: List[ArenaShow]

class HistoryPoint(BaseModel):
    captured_at: datetime
    tweet_count_7d: int

    class Config:
        from_attributes = True

class GameRoundResponse(BaseModel):
    revealed_show: dict
    challenger_show: dict

class GameVerifyRequest(BaseModel):
    revealed_show_id: UUID
    challenger_show_id: UUID
    guess: str

class GameVerifyResponse(BaseModel):
    correct: bool
    revealed_count: int
    challenger_count: int


