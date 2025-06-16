'use client';
import React, { useEffect, useState } from 'react';
import UserAuth from "@/app/utils/auth";
import UserReview from "@/app/utils/review";
import { NumberInput, Textarea, Button, Text, Rating, Image, Card, Divider, Chip, Group } from '@mantine/core';
import { fetchFromAPI } from '@/logic/utils';
import style from './movie.module.css';
import { IconStarFilled } from '@tabler/icons-react';
import { IconStar } from '@tabler/icons-react';

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
        const { success, data: movieRes } = await fetchFromAPI(`/movies/${movieId}`);

        if (success) {
          setMovie(movieRes);
        }

        // const reviewsData = await review.fetchMovieReviews(movieId, token);
        // setReviews(reviewsData);

        if (user) {
          const userReviewsData = await review.fetchUserReviews(movieId, token);

          setMyReview(userReviewsData.rating);
          setReviewText(userReviewsData.rating.comment);
          setReviewRating(userReviewsData.rating.value);
        }
      } catch (err) {
        console.error('Error loading movie page:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId, token]);

  const submitReview = async () => {
    if (!user || !token) {
      alert('You must be logged in to leave a review.');
      return;
    }

    try {
      let updated;
      if (myReview) {
        updated = await review.updateReview({
          movieId,
          rating: reviewRating,
          text: reviewText,
          token,
        });
      }
      else {
        updated = await review.postReview({
          movieId,
          rating: reviewRating,
          text: reviewText,
          token,
        });
      }
      
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
  <div className={style.titleCard}>
    <Card shadow="0" padding="0" radius="lg" className={style.poster}>
      <Image src={movie.poster} height={512} alt={movie.title} fit="cover" />
    </Card>

    <div className={style.details}>
      <h1 className={style.title}>{movie.title}</h1>
      <Divider mb={8}/>

      <div className={style.detailsRow}>
        <div className={style.detailsCol}>
          <span>Rating:</span>
          <span>Release year:</span>
          <span>Director:</span>
        </div>
        <div className={style.detailsCol}>
          <div className={style.alignVertically}>
            <span>{movie.rating ?? "-"}</span> 
            <IconStarFilled/>
          </div>
          <span>{movie.year ?? "-"}</span>
          <span>{movie.director ?? "-"}</span>
        </div>
      </div>

      <Group mt="md" wrap="wrap">
        {movie.genre.map((genre) => (
          <Chip size="sm" key={genre} checked={true} variant='filled' >{genre}</Chip>
        ))}
      </Group>
    </div>
  </div>
  <Divider mt={32} mb={32}/>
      {movie.description && <span className={style.synopsis}>{movie.description}</span>}

       <h2 style={{ marginTop: '2rem' }}>Your Review</h2>
       {user ? (
        <>
          <Rating 
            value={reviewRating}
            onChange={setReviewRating}
            fractions={1}
            emptySymbol={<IconStar/>} 
            fullSymbol={<IconStarFilled />}
          />
          <Textarea
            pt={8}
            placeholder='Your thoughts'
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
