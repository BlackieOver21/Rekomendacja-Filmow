'use client';

import MovieList from "@/components/movieList/MovieList";

export default function Watchlist() {
  return (
      <MovieList endpoint='watchlist'/>
  );
}