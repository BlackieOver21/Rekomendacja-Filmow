from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'account'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(1024), nullable=False)
    watchlist = db.relationship('Watchlist', back_populates='user')


class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movie.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=True)
    watched = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship('User', back_populates='watchlist')
    movie = db.relationship('Movies', back_populates='watchlist_items')

    __table_args__ = (
        db.UniqueConstraint('user_id', 'movie_id', name='unique_user_movie'),
        db.CheckConstraint('(watched = TRUE AND rating >= 0 AND rating <= 5) OR (watched = FALSE AND rating IS NULL)', name='check_rating')
    )


class Movies(db.Model):
    __tablename__ = 'movie'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120))  # tytuł filmu
    watchlist_items = db.relationship('Watchlist', back_populates='movie')