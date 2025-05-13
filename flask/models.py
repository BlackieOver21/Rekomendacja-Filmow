from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'account'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.String(1024), nullable=False)

    watchlist = db.relationship('Watchlist', back_populates='user')
    rating = db.relationship('Rating', back_populates='user')


class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    user_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movie.id'), nullable=False, primary_key=True)

    user = db.relationship('User', back_populates='watchlist')
    movie = db.relationship('Movie', back_populates='watchlist_items')



class Movie(db.Model):
    __tablename__ = 'movie'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128))  # tytuł filmu
    popularity = db.Column(db.Float)
    release_date = db.Column(db.Date)
    runtime = db.Column(db.Integer)
    vote_average = db.Column(db.Float)
    vote_count = db.Column(db.BigInteger)
    imdb_id = db.Column(db.String(16), unique=True)
    tmdb_id = db.Column(db.Integer, unique=True)
    image_url = db.Column(db.String(256))

    watchlist_items = db.relationship('Watchlist', back_populates='movie')
    genre_items = db.relationship('MovieGenre', back_populates='movie_items')
    rating_items = db.relationship('Rating', back_populates='movie')

    


class Genre(db.Model):
    __tablename__ = 'genre'
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(1024))

    movie_items = db.relationship('MovieGenre', back_populates='genre_items')



class MovieGenre(db.Model):
    __tablename__ = 'movie_genre'
    movie_id = db.Column(db.Integer, db.ForeignKey('movie.id'), nullable=False, primary_key=True)
    genre_id = db.Column(db.Integer, db.ForeignKey('genre.id'), nullable=False, primary_key=True)

    movie_items = db.relationship('Movie', back_populates='genre_items')
    genre_items = db.relationship('Genre', back_populates='movie_items')
    

class Rating(db.Model):
    __tablename__ = 'rating'
    user_id = db.Column(db.Integer, db.ForeignKey('account.id'), nullable=False, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movie.id'), nullable=False, primary_key=True)
    value = db.Column(db.Integer, nullable = False)
    comment = db.Column(db.String(65536))

    user = db.relationship('User', back_populates='rating')
    movie = db.relationship('Movie', back_populates='rating_items')

    __table_args__ = (
        db.CheckConstraint('value >= 1 AND value <= 5', name='check_rating'),
    )
