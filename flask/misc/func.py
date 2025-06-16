from flask import current_app
from models import Movie, db, Genre, MovieGenre, Watchlist
import requests
from config import TMDB_API_KEY
from time import sleep
from sqlalchemy.sql.expression import func, not_
from sqlalchemy import select
from sqlalchemy.orm import joinedload
import pandas as pd


def fetch_movie_image(movie: Movie) -> str:
    """
    Fetch movie image URL from TMDB using available identifiers.
    Returns image URL string or None.
    """
    tmdb_key   = current_app.config['TMDB_API_KEY']
    img_base   = current_app.config.get('TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p/')
    api_prefix = 'https://api.themoviedb.org/3'

    def _log_fail(context, resp):
        current_app.logger.warning(
            f"[TMDB] {context} failed ({resp.status_code}): {resp.text}"
        )

    # 1) Try by TMDB ID
    if movie.tmdb_id:
        resp = requests.get(
            f"{api_prefix}/movie/{movie.tmdb_id}",
            params={'api_key': tmdb_key, 'language': 'en-US'}
        )
        if resp.ok:
            data = resp.json()
            if data.get('poster_path'):
                return f"{img_base}original{data['poster_path']}"
        else:
            _log_fail(f"details for TMDB ID {movie.tmdb_id}", resp)

    # 2) Try by IMDb ID via /find
    if movie.imdb_id:
        resp = requests.get(
            f"{api_prefix}/find/{movie.imdb_id}",
            params={
                'api_key': tmdb_key,
                'external_source': 'imdb_id',
                'language': 'en-US'
            }
        )
        if resp.ok:
            results = resp.json().get('movie_results', [])
            if results and results[0].get('poster_path'):
                return f"{img_base}original{results[0]['poster_path']}"
        else:
            _log_fail(f"find by IMDb ID {movie.imdb_id}", resp)

    # 3) Fallback: title + year search
    if movie.title and movie.release_date:
        resp = requests.get(
            f"{api_prefix}/search/movie",
            params={
                'api_key': tmdb_key,
                'language': 'en-US',
                'query': movie.title,
                'primary_release_year': movie.release_date.year,
            }
        )
        if resp.ok:
            results = resp.json().get('results', [])
            if results and results[0].get('poster_path'):
                return f"{img_base}original{results[0]['poster_path']}"
        else:
            _log_fail(f"search by title/year {movie.title}/{movie.release_date.year}", resp)

    return None


def update_movie_image(movie : Movie):
    """Update and store the image URL for a single movie"""
    image_url = fetch_movie_image(movie)
    if image_url:
        movie.image_url = image_url
        db.session.commit()
        return True
    return False

def batch_update_movie_images():
    """Update images for all movies in the database"""
    movies = Movie.query.all()
    updated = 0
    for movie in movies:
        if update_movie_image(movie):
            updated += 1
            sleep(0.05) #limit request rate
    return f"Updated {updated}/{len(movies)} movie images"


def serialize_movie(movie):
    """
    Helper to turn a Movie into JSON-friendly dict.
    """
    genres = [g.genre_items.desc for g in movie.genre_items if g.genre_items]
   
    return {
        "id": movie.id,
        "title": movie.title,
        "year": movie.release_date.year if movie.release_date else None,
        "genre": genres,
        "poster": movie.image_url,
        "rating": movie.vote_average
    }

def query_movies(query, start=None, end=None):
    if end is not None:
        query = query.slice(start, end)
    else:
        query = query.offset(start)

    movies = query.all()

    # Uzupełnij brakujące obrazki (jak w list_movies)
    if end is not None and end - start < 50:
        for mov in movies:
            if not mov.image_url:
                update_movie_image(mov)
                sleep(0.03)

    # Serializacja
    result = []
    for m in movies:
        data = serialize_movie(m)
        result.append(data)

    return 

# def get_recommendations(user_id):

#     watchlisted_movie_ids = (
#         db.session.query(Watchlist.movie_id)
#         .filter(Watchlist.user_id == user_id)
#         .subquery()
#     )

#     # Krok 2: wybierz filmy NIEbędące na watchliście i dołącz gatunki
#     movies = (
#     db.session.query(Movie)
#     .options(joinedload(Movie.genre_items).joinedload(MovieGenre.genre_items))
#     .filter(not_(Movie.id.in_(watchlisted_movie_ids)))
#     .order_by(func.random())  # <- losowe sortowanie
#     .limit(50)
#     .all()
#     )

#     # Krok 3: przetwórz wyniki do listy słowników
#     result = []
#     for movie in movies:
#         genres = [mg.genre_items.desc for mg in movie.genre_items]
#         result.append({
#             "id": movie.id,
#             "title": movie.title,
#             "popularity": movie.popularity,
#             "release_date": movie.release_date,
#             "runtime": movie.runtime,
#             "vote_average": movie.vote_average,
#             "vote_count": movie.vote_count,
#             "genres": genres
#         })

#     # Krok 4: konwersja do DataFrame
#     result

#     for row in result:
        
#     return 