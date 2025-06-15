class UserReview {
    constructor() {
        this.loginURL = "http://192.168.94.12:5000/api/login";
        this.registerURL = "http://192.168.94.12:5000/api/register" ;
        this.authenticateURL = "http://192.168.94.12:5000/api/check-auth";
    }async fetchMovieReviews(movieId, token) {
        const res = await fetch(`http://192.168.94.12:5000/api/reviews/movie/${movieId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch movie reviews');
        return res.json();
    }

    async fetchUserReviews(userId, token) {
        const res = await fetch(`http://192.168.94.12:5000/api/reviews/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.ok) throw new Error('Failed to fetch user reviews');
        return res.json();
    }

    async submitReview({ userId, movieId, rating, text, reviewId, token }) {
        const method = reviewId ? 'PUT' : 'POST';
        const endpoint = reviewId
            ? `http://192.168.94.12:5000/api/reviews/${reviewId}`
            : 'http://192.168.94.12:5000/api/reviews';

        const body = {
            user_id: userId,
            movie_id: parseInt(movieId),
            rating,
            text,
        };

        const res = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error('Failed to submit review');

        return res.json();
    }

}

export default UserReview;