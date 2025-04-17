from flask import Flask
from flask_jwt_extended import JWTManager
from flask_jwt_extended.exceptions import JWTExtendedException
from flask import request

from models import db
from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.movies import movie_bp

from models import db, User

# Config
app = Flask(__name__)
app.config.from_pyfile('config.py')

# Database
db.init_app(app)

# Authentication
jwt = JWTManager(app)

# Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(movie_bp, url_prefix='/api')
app.register_blueprint(profile_bp, url_prefix='/api')

# Middleware to log request information
# @app.before_request
# def log_request_info():
#     print("REQUEST DATA")
#     print("Headers:", request.headers)
#     print("Body:", request.get_data())

if __name__ == '__main__':
    app.run(debug=True)
