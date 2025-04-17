from flask import Blueprint, request, jsonify
from models import Movies

movie_bp = Blueprint('movies', __name__)

@movie_bp.route('/movies', methods=['GET'])
def get_movies():
    """
    Test with:
    
    curl --location 'http://localhost:5000/api/movies?start=2&end=5'
    """
    # Pobierz zakres z query stringa (domyślnie wszystko)
    start = request.args.get('start', default=0, type=int)
    end = request.args.get('end', default=None, type=int)

    # Pobieramy filmy użytkownika
    query = Movies.query.order_by(Movies.id)

    # Jeśli jest zakres, to robimy slice
    if end is not None:
        query = query.slice(start, end)
    else:
        query = query.offset(start)

    results = query.all()

    # Przekształcamy w JSON
    movies = [{"id": w.id, "title": w.title} for w in results]

    return jsonify(movies)
