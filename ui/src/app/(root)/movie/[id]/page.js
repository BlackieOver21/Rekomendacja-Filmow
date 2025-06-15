'use client';
import React, { useEffect, useState } from 'react';
import UserAuth from "@/app/utils/auth";
import UserReview from "@/app/utils/review";
import { NumberInput, Textarea, Button, Text, Rating } from '@mantine/core';

const MoviePage = () => {
  const [movieId, setMovieId] = useState(null);
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const auth = new UserAuth();
  const user = auth.getUser();
  const token = auth.getToken();

  const review = new UserReview();

  useEffect(() => {
    const segments = window.location.pathname.split('/');
    const id = segments[segments.length - 1];
    setMovieId(id);
  }, []);

  useEffect(() => {
    if (!movieId) return;

    const load = async () => {
      try {
        const movieRes = await fetch(`http://192.168.94.12:5000/api/movies/${movieId}`);
        if (movieRes.ok) {
          const data = await movieRes.json();
          setMovie(data);
        }

        const reviewsData = await review.fetchMovieReviews(movieId, token);
        setReviews(reviewsData.slice(0, 10));

        if (user) {
          const userReviewsData = await review.fetchUserReviews(user, token);
          const existing = userReviewsData.find((r) => r.movie_id === parseInt(movieId));
          if (existing) {
            setMyReview(existing);
            setReviewText(existing.text);
            setReviewRating(existing.rating);
          }
        }
      } catch (err) {
        console.error('Error loading movie page:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId]);

  const submitReview = async () => {
    if (!user || !token) {
      alert('You must be logged in to leave a review.');
      return;
    }

    try {
      const updated = await review.submitReview({
        userId: user,
        movieId,
        rating: reviewRating,
        text: reviewText,
        reviewId: myReview ? myReview.id : null,
        token,
      });
      setMyReview(updated);
      alert('Review saved!');
    } catch (err) {
      alert('Error submitting review.');
      console.error(err);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (!movie) return <Text>Movie not found.</Text>;

  return (<div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
    <img
      src={movie.poster}
      alt={`${movie.title} poster`}
      style={{ width: '250px', height: '375px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
    />
    <div>
      <h1>{movie.title}</h1>
      <p><strong>Year:</strong> {movie.year}</p>
      <p><strong>Genres:</strong> {movie.genre.join(', ')}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <strong>Rating:</strong>
        <Rating value={movie.rating} readOnly fractions={2} />
        <span>{movie.rating}</span>
      </div>

      {movie.description && <p style={{ marginTop: '0.5rem' }}>{movie.description}</p>}
    </div>
  </div>

       <h2 style={{ marginTop: '2rem' }}>Your Review</h2>
       {user ? (
        <>
          <NumberInput
            label="Rating"
            value={reviewRating}
            onChange={setReviewRating}
            min={1}
            max={5}
          />
          <Textarea
            label="Review"
            value={reviewText}
            onChange={(e) => setReviewText(e.currentTarget.value)}
          />
          <Button onClick={submitReview} mt="sm">
            {myReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </>
      ) : (
        <p>You must be logged in to leave a review.</p>
      )}

      <h2 style={{ marginTop: '2rem' }}>Recent Reviews</h2>
      {reviews.length === 0 ? (
        <Text>No reviews yet.</Text>
      ) : (
        reviews.map((r) => (
          <div key={r.id} style={{ marginBottom: '1rem' }}>
            <strong>{r.username}</strong> – Rating: {r.rating}
            <p>{r.text}</p>
          </div>
        ))
      )}
</div>
  );
};

export default MoviePage;


// export default function Movie() {
//   return (
//     <></>
//   );
// }