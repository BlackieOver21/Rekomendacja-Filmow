from flask import Blueprint, request, jsonify, abort
from models import Movie, db
import misc.func as fm
from reco.fake_reco import reco

movie_bp = Blueprint('movies', __name__)

@movie_bp.route('/movies', methods=['GET'])
def list_movies():
    """
    Movie List (wszystkie)
    Optional query parameters:
      - start: pagination offset (default: 0)
      - end: pagination end (exclusive)
      - user_id: if provided, will flag recommended movies for that user
    """
    start = request.args.get('start', default=0, type=int)
    end = request.args.get('end', default=None, type=int)
    user_id = request.args.get('user_id', type=int)

    query = Movie.query.order_by(Movie.id)
    if end is not None:
        query = query.slice(start, end)
    else:
        query = query.offset(start)
    movies = query.all()

    # If user_id provided, fetch recommendations and add flag
    recommended_ids = set()
    if user_id is not None:
        try:
            recommended_ids = set(reco(user_id, movies))
        except Exception:
            abort(400, description="Invalid user or recommendation error")

    # Ensure images for small ranges
    if end is not None and end - start < 10:
        for mov in movies:
            if not mov.image_url:
                fm.update_movie_image(mov)

    result = []
    for m in movies:
        data = fm.serialize_movie(m)
        if user_id is not None:
            data['recommended'] = 1 if m.id in recommended_ids else 0
        result.append(data)

    return jsonify(result)
