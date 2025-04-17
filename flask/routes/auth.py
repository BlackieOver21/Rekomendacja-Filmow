from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Test with:

    curl --location 'http://localhost:5000/api/register' \
    --header 'Content-Type: application/json' \
    --data '{
    "username": "test",
    "password": "test"
    }'

    Response:
    {
    "msg": "Username already exists"
    }
    """
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_pw = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Test with:
    
    curl --location 'http://localhost:5000/api/login' \
    --header 'Content-Type: application/json' \
    --data '{
    "username": "test",
    "password": "test"
    }'
    """
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id)) 
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Invalid credentials"}), 401
