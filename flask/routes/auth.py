from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token,  jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    # create token
    access_token = create_access_token(identity=str(new_user.id))

    return jsonify({
        "msg": "User created",
        "access_token": access_token,
        "user": {"id": new_user.id, "username": new_user.username}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": {"id": user.id, "username": user.username}
        }), 200

    return jsonify({"msg": "Invalid credentials"}), 401



@auth_bp.route('/auth/check', methods=['GET'])
@jwt_required()
def check_auth():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"authenticated": False}), 401

    return jsonify({
        "authenticated": True,
        "user": {"id": user.id, "username": user.username}
    }), 200



@auth_bp.route('/auth/change_password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json() or {}
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({"msg": "Old and new passwords required"}), 400

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not check_password_hash(user.password, old_password):
        return jsonify({"msg": "Invalid old password"}), 401

    user.password = generate_password_hash(new_password)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "msg": "Password changed successfully",
        "access_token": access_token,
        "user": {"id": user.id, "username": user.username}
    }), 200
