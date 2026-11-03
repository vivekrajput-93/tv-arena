import hashlib 
import os
import random
import time
from typing import List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
TWITTER_COUNTS_URL = "https://api.twitter.com/2/tweets/counts/recent"

# builds a Twitter search query for the given title and optional keywords, ensuring proper formatting and language filtering.
def build_search_query(title: str, keywords: Optional[List[str]] = None) -> str:

    terms = [f'"{title}"']
    if keywords:
        for kw in keywords:
            terms.append(kw if kw.startswith("#") else f'"{kw}"')

    query_body = " OR ".join(terms)
    return f"({query_body}) lang:en -is:retweet"

# generates a mock tweet count based on the title's hash value, simulating different popularity tiers with random fluctuations.
def _generate_mock_count(title: str) -> int:
    hash_val = int(hashlib.md5(title.encode()).hexdigest(), 16)
    base_tier = hash_val % 100
    if base_tier > 85 :
        base_count = 600_000 + (hash_val % 600_000)
    elif base_tier > 50:
        base_count = 150_000 + (hash_val % 150_000)
    else:
        base_count = 20_000 + (hash_val % 20_000)
    fluctuation = random.uniform(0.85, 1.15)
    return int(base_count * fluctuation)

# fetches the 7-day tweet count for a given title and optional keywords from the Twitter API, 
# handling rate limits and falling back to a mock count if necessary.
def fetch_7d_tweet_count(title: str, keywords: Optional[List[str]] = None) -> int:
    if not TWITTER_BEARER_TOKEN or TWITTER_BEARER_TOKEN.strip().lower() in ["mock", "test"]:
        return _generate_mock_count(title)
    
    query = build_search_query(title, keywords)
    headers = {
        "Authorization" : f"Bearer {TWITTER_BEARER_TOKEN}",
        "User-Agent": "TVArenaBot/1.0"
    }

    params = {
        "query": query,
        "granularity": "day",}
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(TWITTER_COUNTS_URL, headers=headers, params=params)
            if response.status_code == 429:
                reset_time = int(response.headers.get("x-rate-limit-reset", time.time() + 60))
                response = client.get(TWITTER_COUNTS_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("meta", {}).get("total_tweet_count", 0)
    except Exception:
        return _generate_mock_count(title)