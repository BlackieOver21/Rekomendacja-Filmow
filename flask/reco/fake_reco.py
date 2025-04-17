import random
from models import Movies

def reco(user_id):
    """
    Make a random recommendation based on id of a user.
    """
    random.seed(user_id)

    movie_count = Movies.query.count()
    if movie_count == 0:
        return None

    random_index = random.randint(0, movie_count - 1)

    recommended_movie = Movies.query.offset(random_index).first()

    return recommended_movie.id if recommended_movie else None