import os 
import re
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi

from app.db.database import SessionLocal
from backend.app.models.model import Show

DATASET_NAME = "asaniczka/full-tmdb-tv-shows-dataset-2023-150k-shows"
DOWNLOAD_DIR = "./data"
CSV_FILE_NAME = "TMDB_tv_dataset_v3.csv"

def download_and_extract_dataset():
    # Authenticate and download the dataset from kaggle
    api = KaggleApi()
    api.authenticate()

    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    print(f"Downloading dataset '{DATASET_NAME}'...")
    api.dataset_download_files(DATASET_NAME, path=DOWNLOAD_DIR, unzip=True)
    print(f"Dataset downloaded and extracted to '{DOWNLOAD_DIR}'.")


def generate_slug(text : str) -> str:
    # Create a slug from the given text
    text = text.lower()
    return re.sub(r"[^\w\s-]", "", text).replace(" ", "-")

def generate_keywords(title: str) -> list[str]:
    # Generate search keywords from the title
    clean_title = re.sub(r"[^\w\s]", "", title)
    compact_title = "".join(clean_title.split())
    return [f"#{compact_title}", f"{title} TV"]

def seed_shows(limit: int = 250):
    # Parses Kaggle CSV and insert top shows into the supabase database
    csv_path = os.path.join(DOWNLOAD_DIR, CSV_FILE_NAME)


    if not os.path.exists(csv_path):
        download_and_extract_dataset()

        print(f"Reading CSV file '{csv_path}'...")
        df = pd.read_csv(csv_path)

        # Filter out rows with missing titles
        filtered_df = (
            df[df["vote_count"]  > 100]
            .sort_values(by="vote_average", ascending=False)
            .head(limit)
        )

        db = SessionLocal()
        inserted_count = 0

        try:
            for _, row in filtered_df.iterrows():
                title = row["name"].strip()

                if not title:
                    continue  # Skip rows with empty titles


                slug = generate_slug(title)

                existing = db.query(Show).filter(Show.slug == slug).first()
                if existing:
                    continue  # Skip if the show already exists in the database

                air_date = str(row.get("first_air_date", ""))
                first_air_year = (
                int(air_date[:4])
                if len(air_date) >= 4 and air_date[:4].isdigit()
                else None
                )

                # genres are stored as a comma-separated string in the CSV, so we need to split them into a list
                genres_raw = str(row.get("genres", ""))
                genres = [g.strip() for g in genres_raw.split(",") if g.strip()]

                poster_path = row.get("poster_path", "")
                poster_url = (
                    f"https://image.tmdb.org/t/p/w500{poster_path}" 
                    if pd.notna(poster_path)
                    else None
                )

                show = Show(
                    title=title,
                    slug=slug,
                    poster_url=poster_url,
                    genres=genres,
                    first_air_year=first_air_year,
                    search_keywords=generate_keywords(title),
                )
                db.add(show)
                inserted_count += 1

            db.commit()
            print(f"Inserted {inserted_count} shows into the database.")

        except Exception as e:
            db.rollback()
            print(f"Error occurred while seeding shows: {e}")
        finally:
            db.close()

if __name__ == "__main__":
    seed_shows(limit=250)

