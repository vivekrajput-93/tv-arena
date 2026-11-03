import uuid
from datetime import date, datetime
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship
from app.db.database import Base

class Show(Base):
    __tablename__ = "shows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    imdb_id = Column(String, unique=True, nullable=True)
    title = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    poster_url = Column(String, nullable=True)
    genres = Column(ARRAY(String), default=[])
    first_air_year = Column(Integer, nullable=True)
    search_keywords = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    snapshots = relationship("PopularitySnapshot", back_populates="show", cascade="all, delete-orphan")
    rankings = relationship("DailyRanking", back_populates="show", cascade="all, delete-orphan")


class PopularitySnapshot(Base):
    __tablename__ = "popularity_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id", ondelete="CASCADE"), nullable=False)
    tweet_count_7d = Column(Integer, nullable=False)
    captured_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    show = relationship("Show", back_populates="snapshots")


class DailyRanking(Base):
    __tablename__ = "daily_rankings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id", ondelete="CASCADE"), nullable=False)
    ranking_date = Column(Date, nullable=False)
    rank = Column(Integer, nullable=False)
    tweet_count_7d = Column(Integer, nullable=False)
    rank_change = Column(Integer, default=0)

    show = relationship("Show", back_populates="rankings")

    __table_args__ = (
        UniqueConstraint("ranking_date", "show_id", name="unique_show_date"),
    )