from flask import Flask
from flask_login import LoginManager
import os
from dotenv import load_dotenv

from models import User
from db import db
from routes.dashboard import dashboard_bp
from routes.auth import auth_bp
from routes.main import main_bp

load_dotenv()   # Read constants from .env file

def configuration(db=db):

    app = Flask(__name__, template_folder='templates')

    #   Initialize database access
    app.config['SECRET_KEY'] = os.getenv('SECRETKEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'postgresql://{os.getenv("PGUSER")}:'
        f'{os.getenv("PGPASSWORD")}@{os.getenv("PGHOST")}:'
        f'{os.getenv("PGPORT")}/{os.getenv("PGDATABASE")}'
    )

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/auth') 
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(main_bp)

    #   Initialize login manager
    login_manager = LoginManager(app)
    login_manager.init_app(app) 
    login_manager.login_view = 'auth.login'
    return app, db, login_manager

app, db, login_manager = configuration(db)

#   Define a function to load the user from the database
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

if __name__ == '__main__':
    app.run(debug=True)
