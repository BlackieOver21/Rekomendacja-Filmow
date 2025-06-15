'use client';

import MovieList from "@/components/movieList/MovieList";

export default function Watched() {
  return (
    <MovieList endpoint='watched'/>
  );
}