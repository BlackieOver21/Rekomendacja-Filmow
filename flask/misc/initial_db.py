import pandas as pd
from models import db, Movie, Genre, MovieGenre  # adjust import to your structure
import ast
from datetime import datetime
import numpy as np
import math
from tqdm import tqdm

def import_movies_if_empty(
    movies_path='movies_metadata.csv',
    links_path='links.csv'
):
    # Skip if already populated
    if db.session.query(Movie).first():
        print("Movie table is not empty. Skipping import.")
        return

    print("Importing movies, genres, and external links from CSV files...")

    # Load movie metadata
    movie_cols = [
        'id', 'title', 'genres',
        'popularity', 'release_date', 'runtime',
        'vote_average', 'vote_count', "poster_path", "imdb_id"
    ]
    df = pd.read_csv(movies_path, low_memory=False, usecols=movie_cols, dtype='string')

    target_dtypes = {
        'id'                : 'Int32',
        'title'             : 'string',
        'genres'            : 'object',
        'popularity'        : 'float32',
        'release_date'      : 'string',
        'runtime'           : 'Int32',
        'vote_average'      : 'float32',
        'vote_count'        : 'Int64',
        'poster_path'       : "string",
        "imdb_id"           : "string"
    }

    for col, dtype in target_dtypes.items():
        if dtype in ('Int32', 'float32'):
            # numeric types → coerce invalid to NaN, then cast
            df[col] = pd.to_numeric(df[col], errors='coerce').astype(dtype)
        elif dtype == 'Int64':
            # pandas nullable integer
            df[col] = pd.to_numeric(df[col], errors='coerce').astype('Int64')
        else:
            # any string/object type
            df[col] = df[col].astype(dtype)



    # Load and clean links data
    # links_df = pd.read_csv(links_path, usecols=['movieId', 'imdbId', 'tmdbId'], dtype={
    #     'movieId': 'int32',      # or 'Int64' for nullable ints
    #     'imdbId': 'string',     
    #     'tmdbId': 'string'        
    # })

    # links_df = links_df[links_df['movieId'].apply(lambda x: str(x).isdigit())]
    # links_df['movieId'] = links_df['movieId'].astype(int)
    
    # links_df['imdbId'] = links_df['imdbId'].apply(
    # lambda x: str(x) if pd.notna(x) and str(x).isdigit() else None
    # )

    # # Clean tmdbId: int or None

    # links_df['tmdbId'] = pd.Series( [int(x) if str(x).isdigit() else None for x in links_df['tmdbId']] , dtype=object) 


    # links_df = links_df.drop_duplicates(subset=['movieId'])
    # # Rename to match Movie fields
    # links_df = links_df.rename(columns={
    #     'movieId': 'id',
    #     'imdbId': 'imdb_id',
    #     'tmdbId': 'tmdb_id'
    # })

    # links_df = links_df.drop_duplicates(subset=['tmdb_id'])

    # Clean movie dataframe
    df.rename(columns={'id': 'tmdb_id'}, inplace=True)
    df = df.dropna(subset=['title'])   #'id',
    df['id'] = range(0, len(df))
    df = df[df['id'].apply(lambda x: str(x).isdigit())]
    df['id'] = df['id'].astype('int32')
    df.drop_duplicates(subset=['tmdb_id'], keep='first', inplace=True)
    df.drop_duplicates(subset=['imdb_id'], keep='first', inplace=True)

    # # Merge link IDs into movies
    # df = df.merge(
    #     links_df,
    #     on='id',
    #     how='left'
    # )


    # magic lines, won't work at all without them for whatever reason
    df['imdb_id'] = df['imdb_id'].where(pd.notna(df['imdb_id']), None)
    df['tmdb_id'] = df['tmdb_id'].where(pd.notna(df['tmdb_id']), None)


    #do not try,  4h wasted
    #increase the /\ counter if you fail
    #seems to work, but it's not a good solution
    # 1) First coerce everything to numeric, invalid → NaN
    df['runtime'] = pd.Series(clean_runtime_column(df['runtime']), index=df.index, dtype=object) 
    df['vote_count'] = pd.Series(clean_runtime_column(df['vote_count']), index=df.index, dtype=object) 
    
    #last ditch effort
    for column in ["id", "tmdb_id", "imdb_id", "poster_path"]:
        df[column] = pd.Series(clean_runtime_column(df[column]), index=df.index, dtype=object) 


    assert df['runtime'].dtype == object
    assert df['vote_count'].dtype == object
    assert all((isinstance(x, int) or x is None) for x in df['runtime'])
    print(df.head())

    #return

    # Extract all unique genres
    unique_genres = {}
    for entry in df['genres'].fillna('[]'):
        try:
            genres_list = ast.literal_eval(entry)
        except (ValueError, SyntaxError):
            genres_list = []
        for g in genres_list:
            gid = int(g.get('id'))
            name = g.get('name')
            unique_genres.setdefault(gid, name)

    # Bulk insert genres
    for gid, desc in unique_genres.items():
        db.session.add(Genre(id=gid, desc=desc))
    db.session.commit()
    print(f"Imported {len(unique_genres)} unique genres.")

    # Insert movies with metadata, genres, and link IDs
    batch_cntr = 0
    for _, row in tqdm(df.iterrows()):
        #print(row)
        movie = Movie(
            id=row['id'],
            title=row['title'],
            popularity=row.get('popularity'),
            release_date=_parse_date(row.get('release_date')),
            runtime=row.get('runtime'),
            vote_average=row.get('vote_average'),
            vote_count=row.get('vote_count'),
            imdb_id=row.get('imdb_id'),
            tmdb_id=row.get('tmdb_id'),
            image_url = row.get("poster_path")
        )
        # Associate genres
        try:
            genres_list = ast.literal_eval(row.get('genres', '[]'))
        except (ValueError, SyntaxError):
            genres_list = []
        for g in genres_list:
            #genre_obj = Genre.query.get(int(g.get('id')))
            genre_assoc = MovieGenre(movie_id = row['id'], genre_id = g.get('id'))
            if genre_assoc:
                movie.genre_items.append(genre_assoc)

        db.session.add(movie)
        batch_cntr += 1
        # Commit in batches
        try:
            if batch_cntr >= 100:
                db.session.commit()
                batch_cntr = 0
        except Exception as e:
            batch_cntr = 0
            print(e)
    # Final commit
    try:
        db.session.commit()
    except Exception as e:
        print(e)
        pass

    print(f"Imported {df.shape[0]} movies with full metadata and links.")


def _parse_date(date_str):
    """
    Parse a 'YYYY-MM-DD' string to date, or return None if invalid.
    """
    if not isinstance(date_str, str) or not date_str:
        return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None


def clean_runtime_column(col):
    cleaned = []
    for x in col:
        # 1) Catch pandas/NumPy nulls (NaN, <NA>, None, NaT)
        if pd.isna(x):
            cleaned.append(None)
            continue

        # 2) Try to coerce to float (catches strings, etc.)
        try:
            num = float(x)
        except (ValueError, TypeError):
            cleaned.append(None)
            continue

        # 3) Check again for NaN
        if math.isnan(num):
            cleaned.append(None)
        else:
            # 4) Convert to Python int
            cleaned.append(int(num))
    return cleaned