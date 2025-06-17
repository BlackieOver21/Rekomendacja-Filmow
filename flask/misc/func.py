from flask import current_app
from models import Movie, db, Genre, MovieGenre, Watchlist
import requests
from config import TMDB_API_KEY
from time import sleep
from sqlalchemy.sql.expression import func, not_
from sqlalchemy import select
from sqlalchemy.orm import joinedload
import pandas as pd


def mix_rating_dataset(rating, count, fake_rating, fake_count):
    return count / (count + fake_count) * rating + fake_count / (count + fake_count) * fake_rating

def fetch_movie_image(movie: Movie):
    try:
        tmdb_key = current_app.config['TMDB_API_KEY']
        img_base_url = current_app.config.get('TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p/')
        img_size = current_app.config.get('TMDB_POSTER_SIZE', 'w780') # Use a reasonable default size
        api_base_url = 'https://api.themoviedb.org/3'
        language = current_app.config.get('TMDB_LANGUAGE', 'en-US')
    except KeyError:
        current_app.logger.error("[TMDB] TMDB_API_KEY is not configured.")
        return None

    session = requests.Session()
    session.params = {'api_key': tmdb_key, 'language': language}

    def _make_request(endpoint, params = None):
        """Helper to make a request, handle errors, and return JSON."""
        try:
            resp = session.get(f"{api_base_url}{endpoint}", params=params)
            resp.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)
            return resp.json()
        except requests.exceptions.RequestException as e:
            current_app.logger.warning(f"[TMDB] API request to '{endpoint}' failed: {e}")
            return None

    def _get_poster_url(data):
        """Extracts and constructs the poster URL from API response data."""
        poster_path = data.get('poster_path')
        if poster_path:
            return f"{poster_path}" #{img_base_url}{img_size}
        return None

    #tmdbid
    if movie.tmdb_id:
        data = _make_request(f"/movie/{movie.tmdb_id}")
        if data and (poster_url := _get_poster_url(data)):
            current_app.logger.info(f"[TMDB] Found poster for TMDB ID {movie.tmdb_id}")
            return poster_url

    #imdb
    if movie.imdb_id:
        find_params = {'external_source': 'imdb_id'}
        data = _make_request(f"/find/{movie.imdb_id}", params=find_params)
        if data and data.get('movie_results'):
            first_result = data['movie_results'][0]
            if poster_url := _get_poster_url(first_result):
                current_app.logger.info(f"[TMDB] Found poster for IMDb ID {movie.imdb_id}")
                return poster_url

    #tile & year
    if movie.title and movie.release_date:
        search_params = {
            'query': movie.title,
            'primary_release_year': movie.release_date.year,
        }
        data = _make_request("/search/movie", params=search_params)
        if data and data.get('results'):
            first_result = data['results'][0]
            if poster_url := _get_poster_url(first_result):
                current_app.logger.info(f"[TMDB] Found poster via search for '{movie.title}' ({movie.release_date.year})")
                return poster_url

    current_app.logger.warning(f"[TMDB] Could not find poster for movie: {movie.title}")
    return None


def update_movie_image(movie : Movie):
    """Update and store the image URL for a single movie"""
    if movie.image_url:
        return None

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
        status = update_movie_image(movie)
        if status == True:
            updated += 1
            sleep(0.05) #limit request rate
    return f"Updated {updated}/{len(movies)} movie images"


def serialize_movie(movie):
    """
    Turn a Movie into a JSON-friendly dict, using only the model's defined fields
    plus genres, with vote_average/count blended with user ratings.
    """
    # genres
    genres = [g.genre_items.desc for g in movie.genre_items if g.genre_items]

    # TMDB stats
    tmdb_avg = movie.vote_average or 0
    tmdb_count = movie.vote_count or 0

    # user ratings
    user_values = [r.value for r in movie.rating_items]
    user_count = len(user_values)
    user_avg = sum(user_values) / user_count if user_count else 0

    # blended average and total count
    blended_avg = mix_rating_dataset(
        rating=tmdb_avg,
        count=tmdb_count,
        fake_rating=user_avg,
        fake_count=user_count
    )
    total_count = tmdb_count + user_count

    return {
        "id": movie.id,
        "title": movie.title,
        #"popularity": movie.popularity,
        "year": movie.release_date.isoformat() if movie.release_date else None,
        #"runtime": movie.runtime,
        "genre": genres,
        "rating": round(blended_avg, 2) if blended_avg is not None else None,
        #"vote_count": total_count,
        #"imdb_id": movie.imdb_id,
        #"tmdb_id": movie.tmdb_id,
        "image_url": movie.image_url
    }



def query_movies(query, start=None, end=None):
    if end is not None:
        query = query.slice(start, end)
    else:
        query = query.offset(start)

    movies = query.all()

    # Uzupełnij brakujące obrazki (jak w list_movies)
    update_cnt = 0
    if end is not None:
        for mov in movies:
            if update_cnt < 50 and not mov.image_url:
                update_movie_image(mov)
                sleep(0.03)
                update_cnt +=1

    # Serializacja
    result = []
    for m in movies:
        data = serialize_movie(m)
        result.append(data)

    return result

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