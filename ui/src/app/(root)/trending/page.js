'use client';

import MovieList from "@/components/movieList/MovieList";

export default function Trending() {
  return (
    <MovieList recommended={false} endpoint='movies'/>
  );
}