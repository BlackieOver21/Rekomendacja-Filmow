from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import Movie, Rating, db
import misc.func as fm
from reco.reco import reco
from time import sleep
from sqlalchemy.sql.expression import func

movie_bp = Blueprint('movies', __name__)

@movie_bp.route('/movies', methods=['GET'])
def list_movies():
    """
    Movie List (wszystkie)
    Optional query parameters:
      - start: pagination offset (default: 0)
      - end: pagination end (exclusive)
    """
    start = request.args.get('start', default=0, type=int)
    end = request.args.get('end', default=None, type=int)

    query = Movie.query.order_by(Movie.id)

    result = fm.query_movies(query, start, end)
    return jsonify(result) #already serialized using serialize_movie


@movie_bp.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    movie = Movie.query.get(movie_id)
    
    if movie is None:
        abort(404, description="Movie not found")

    if not movie.image_url:
        fm.update_movie_image(movie)
        sleep(0.02)


    return jsonify(fm.serialize_movie(movie))

@movie_bp.route('/movies/<int:movie_id>/ratings', methods=['GET'])
def get_ratings(movie_id):
    movie = Movie.query.get(movie_id)
    
    if movie is None:
        jsonify([]), 200 #abort(404, description="Movie not found")
    movie

    ratings = (
    db.session.query(Rating)
    .filter(Rating.movie_id == movie_id)
    .all()
    )
    rating_list = [
        {
            "user_id": r.user_id,
            "movie_id": r.movie_id,
            "rating": r.value,
            "comment": r.comment
        }
        for r in ratings
    ]

    return jsonify(rating_list)


@movie_bp.route('/movies/random', methods=['GET'])
def get_random_movie():
    random_movie = Movie.query.order_by(func.random()).first()
    if random_movie is None:
        abort(404, description="Movie database is empty!")
    
    return jsonify(fm.serialize_movie(random_movie))



@movie_bp.route('/movies/watched', methods=['GET'])
@jwt_required()
def get_watched_movies():
    user_id = get_jwt_identity()

    ratings = (
        Rating
        .query
        .filter_by(user_id=user_id)
        .join(Movie, Movie.id == Rating.movie_id)
        .all()
    )

    if not ratings:
        return jsonify([])

    results = []
    for r in ratings:
        m = r.movie
        movie_data = fm.serialize_movie(m)
        movie_data.update({
            "rating":  r.value,
            "comment": r.comment,
        })
        results.append(movie_data)

    return jsonify(results), 200

@movie_bp.route('/movies/recommended', methods=['GET'])
@jwt_required()
def get_recommended_movies():
    user_id = get_jwt_identity()

    recs =  None#fm.get_recommendations(user_id) #placeholder

    movies = []
    if not recs:
        return jsonify([]), 200

    #what will the ML give us??
    if isinstance(recs[0], int):
        movies = Movie.query.filter(Movie.id.in_(recs)).all()
    elif isinstance(recs[0], tuple):
        movies = [pair[0] for pair in recs]

    result = []
    for m in movies:
        data = fm.serialize_movie(m)
        result.append(data)

    return jsonify(result), 200