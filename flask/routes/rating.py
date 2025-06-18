from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token,  jwt_required, get_jwt_identity
from models import Rating, db
import misc.func as fm
from .movies import get_ratings

rating_bp = Blueprint('rating', __name__)

@rating_bp.route('/ratings', methods=['POST'])
@jwt_required()
def create_rating():
    data = request.get_json() or {}
    movie_id = data.get('movie_id')
    value = data.get('value')
    comment = data.get('comment')

    if not movie_id or not value:
        return jsonify({"msg": "movie_id and value are required"}), 400

    user_id = get_jwt_identity()
    # check if rating exists
    existing = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if existing:
        return jsonify({"msg": "Rating already exists. Use PUT to update."}), 400

    rating = Rating(user_id=user_id, movie_id=movie_id, value=value, comment=comment)
    db.session.add(rating)
    db.session.commit()

    return jsonify({
        "msg": "Rating created",
        "rating": {"user_id": rating.user_id, "movie_id": rating.movie_id, "value": rating.value, "comment": rating.comment}
    }), 201

@rating_bp.route('/ratings/<int:movie_id>', methods=['GET'])
@jwt_required()
def get_rating(movie_id):
    return get_ratings(movie_id)
    # user_id = get_jwt_identity()
    # rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    # if not rating:
    #     return jsonify([]), 200 #jsonify({"msg": "Rating not found"}), 404
    # return jsonify({
    #     "rating": {"user_id": rating.user_id, "movie_id": rating.movie_id, "rating": rating.value, "comment": rating.comment}
    # }), 200

@rating_bp.route('/ratings/<int:movie_id>', methods=['PUT'])
@jwt_required()
def update_rating(movie_id):
    data = request.get_json() or {}
    value = data.get('value')
    comment = data.get('comment')

    if value is None:
        return jsonify({"msg": "value is required"}), 400

    user_id = get_jwt_identity()
    rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if not rating:
        return jsonify({"msg": "Rating not found"}), 404

    rating.value = value
    rating.comment = comment
    db.session.commit()

    return jsonify({
        "msg": "Rating updated",
        "rating": {"user_id": rating.user_id, "movie_id": rating.movie_id, "value": rating.value, "comment": rating.comment}
    }), 200

@rating_bp.route('/ratings/<int:movie_id>', methods=['DELETE'])
@jwt_required()
def delete_rating(movie_id):
    user_id = get_jwt_identity()
    rating = Rating.query.filter_by(user_id=user_id, movie_id=movie_id).first()
    if not rating:
        return jsonify({"msg": "Rating not found"}), 404

    db.session.delete(rating)
    db.session.commit()

    return jsonify({"msg": "Rating deleted"}), 200