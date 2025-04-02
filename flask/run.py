from app import app, db
from flask_login import LoginManager




with app.app_context():
    login_manager = LoginManager(app)
    login_manager.init_app(app)

    login_manager.login_view = 'auth.auth.login'
    db.create_all()  # For example, creating the tables