from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from reco.fake_reco import reco
from models import db, Watchlist, Movies

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/watchlist', methods=['GET'])
@jwt_required()
def get_watchlist():
    user_id = get_jwt_identity()

    # Pobierz zakres z query stringa (domyślnie wszystko)
    start = request.args.get('start', default=0, type=int)
    end = request.args.get('end', default=None, type=int)

    # Pobieramy filmy użytkownika
    query = Watchlist.query.filter_by(user_id=user_id)

    # Jeśli jest zakres, to robimy slice
    if end is not None:
        query = query.slice(start, end)
    else:
        query = query.offset(start)

    results = query.all()

    # Przekształcamy w JSON
    watchlist = [{"id": w.id, "title": w.title} for w in results]

    return jsonify(watchlist)

@profile_bp.route('/watchlist', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    user_id = get_jwt_identity()

    try:
        data = request.get_json()
    except Exception as e:
        return jsonify({"msg": "Invalid JSON", "error": str(e)}), 400

    movie_id = data.get('movie_id')
    if not movie_id:
        return jsonify({"msg": "Missing movie_id"}), 400

    # Sprawdzenie, czy film istnieje
    movie = Movies.query.get(movie_id)
    if not movie:
        return jsonify({"msg": f"Movie with id {movie_id} not found"}), 404

    # Dodanie do watchlisty
    new_entry = Watchlist(user_id=user_id, movie_id=movie_id)
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({
        "msg": "Movie added to watchlist",
        "id": new_entry.id,
        "movie_id": new_entry.movie_id,
        "title": movie.title  # dodatkowo możesz zwrócić tytuł
    }), 201

# main.py (lub odpowiedni plik z trasami)

@profile_bp.route('/recommendation', methods=['GET'])
@jwt_required()
def recommendation():
    """
    Test with:

    curl --location 'http://192.168.8.104:5000/api/recommendation' \
    --header 'Authorization: Bearer <JWT token>
    """
    user_id = get_jwt_identity()

    # Wywołanie funkcji losującej, która zwraca ID filmu
    movie_id = reco(user_id)

    if movie_id is None:
        return jsonify({"msg": "No movies available for recommendation"}), 404

    # Pobieramy szczegóły filmu z bazy
    recommended_movie = Movies.query.get(movie_id)

    return jsonify({
        "msg": "Movie recommended",
        "id": recommended_movie.id,
        "title": recommended_movie.title
    })
