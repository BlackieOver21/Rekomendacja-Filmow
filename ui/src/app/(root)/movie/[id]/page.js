'use client';

import React, { useCallback, useEffect, useState } from 'react';
import UserAuth from "@/utils/auth";
import UserReview from "@/utils/review";
import { Textarea, Button, Text, Rating, Image, Card, Divider, Chip, Group } from '@mantine/core';
import { fetchFromAPI, FetchMethod } from '@/utils/utils';
import style from './movie.module.css';
import { IconStarFilled } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export default function MoviePage() {
  const [movieId, setMovieId] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const path = usePathname();

  const auth = new UserAuth();
  const user = auth.getUser();
  const token = auth.getToken();

  useEffect(() => {
    const segments = path.split('/');
    const id = segments[segments.length - 1];
    setMovieId(id);
  }, [path]);

  useEffect(() => {
    if (!movieId) return;

    async function load() {
      try {
        const { success, data: movieRes } = await fetchFromAPI(`/movies/${movieId}`);
        if (success) {
          setMovie(movieRes);
        }
      } 
      catch (err) {
        console.error('Error loading movie page:', err);
      } 
      finally {
        setLoading(false);
      }
    };
    load();
  }, [movieId, token]);

  if (loading) return <Text>Loading...</Text>;
  if (!movie) return <Text>Movie not found.</Text>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div className={style.titleCard}>
        <Card shadow="0" padding="0" radius="lg" className={style.poster}>
          <Image src={"http://image.tmdb.org/t/p/w300"+movie.image_url} height={512} alt={movie.title} fit="cover" />
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
                <span>{movie.rating.toFixed(1) ?? "-"}</span> 
                <IconStarFilled/>
              </div>
              <span>{movie.year ?? "-"}</span>
              <span>{movie.director ?? "-"}</span>
            </div>
          </div>

          <Group mt="md" wrap="wrap">
            {movie.genre.map((genre) => (
              <Chip size="xxs" key={genre} checked={true} variant='filled'><span className={style.chip}>{genre}</span></Chip>
            ))}
          </Group>
        </div>
      </div>

      {movie.description && <>
        <Divider mt={32} mb={32}/>
        <span className={style.synopsis}>
          {movie.description}
        </span>
      </>}

      <UserRatingForm user={user} movieId={movieId} token={token}/>
      <MovieReviews/>
    </div>
  );
};

function MovieReviews() {
  const [reviews, setReviews] = useState([]);

  // TODO: fetching global reviews of a movie
  // const reviewsData = await review.fetchMovieReviews(movieId, token);
  // setReviews(reviewsData);

  return (
    <>
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
    </>
  );
}

function UserRatingForm({ user, token, movieId }) {
  const [myReview, setMyReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);

  //const review = new UserReview();
  const review = useMemo(() => new UserReview(), []);

  useEffect(() => {
    async function loadRating() {
      try {
        if (user) {
          const userReviewsData = await review.fetchUserReviews(movieId, token);

          setMyReview(userReviewsData.rating);
          setReviewText(userReviewsData.rating.comment);
          setReviewRating(userReviewsData.rating.rating);
        }
      } catch (err) {
        console.error('Error loading ratings:', err);
      }
    };
    loadRating();
  }, [user, movieId, token, setMyReview, setReviewText, setReviewRating, review]);

  const submitReview = useCallback(async () => {
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
  }, [user, token, myReview, review, movieId, reviewRating, reviewText, setMyReview]);

  return (
    <Card radius={0} withBorder pt={24} pb={24} pl={36} pr={36} mt={24}>
      {user ? (
        <div>
          <div className={style.ratingWrapper}>
            <span>My rating:</span>
            <Rating 
              value={reviewRating}
              onChange={setReviewRating}
              fractions={1}
              size='lg'
              // emptySymbol={<IconStar/>} 
              // fullSymbol={<IconStarFilled />}
            />
          </div>

          <Textarea
            pt={8}
            placeholder='Your thoughts'
            value={reviewText}
            onChange={(e) => setReviewText(e.currentTarget.value)}
          />

          <div className={style.buttonWrapper}>
            <Button onClick={submitReview} mt="sm">
              {myReview ? 'Update Review' : 'Submit Review'}
            </Button>

            <WatchlistControls user={user} movieId={movieId} token={token}/>
          </div>
        </div>
      ) : (
        <span>You must be logged in to leave a review.</span>
      )}
    </Card>
  );
}

function WatchlistControls({ user, movieId, token }) {
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        if (user) {
          const { success, data } = await fetchFromAPI(
            `/watchlist`, 
            FetchMethod.GET,
            { "Authorization": `Bearer ${token}` },
          );
          if (success) {
            setIsOnWatchlist(data.some((movie) => movie.id === movieId));
          }
        }
      } catch (err) {
        console.error('Error loading watchlist:', err);
      }
    };
    loadWatchlist();
  }, [user, movieId, token]);

  const addToWatchlist = useCallback(async () => {
    try {
      if (user) {
        const { success, data } = await fetchFromAPI(
          `/watchlist`, 
          FetchMethod.POST,
          { "Authorization": `Bearer ${token}` },
          { movie_id: movieId }
        );

        if (success) {
          setIsOnWatchlist(true);
          alert('Added to watchlist!');
        }
      }
    } catch (err) {
      alert('Error adding to watchlist.');
      console.error(err);
    }
  }, [user, movieId, token]);

  const removeFromWatchlist = useCallback(async () => {
    try {
      if (user) {
        const { success, data } = await fetchFromAPI(
          `/watchlist/${movieId}`, 
          FetchMethod.DELETE,
          { "Authorization": `Bearer ${token}` },
        );
        
        if (success) {
          setIsOnWatchlist(false);
          alert('Removed from watchlist!');
        }
      }
    } catch (err) {
      alert('Error removing from watchlist.');
      console.error(err);
    }
  }, [user, movieId, token]);

  return (
    <>{isOnWatchlist ? 
      <Button 
        variant='outline' 
        color='paleBlue.3'
        onClick={removeFromWatchlist}
        mt="sm"
      >
        Remove from Watchlist
      </Button>
      :
      <Button 
        variant='outline' 
        color='paleBlue.3'
        onClick={addToWatchlist}
        mt="sm"
      >
        Add to Watchlist
      </Button>
    }</>
  );
}