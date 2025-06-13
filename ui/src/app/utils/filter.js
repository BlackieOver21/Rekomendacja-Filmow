export function filterMovies(movies, criteria) {
  const {
    search = '',
    genresInclusive = [],
    genresExclusive = [],
    ratingFrom = null,
    ratingTo = null,
    yearFrom = null,
    yearTo = null,
  } = criteria;

  return movies.filter((movie) => {
    const matchesSearch =
      search === '' || movie.title.toLowerCase().includes(search.toLowerCase());

    const matchesIncludeGenre =
      genresInclusive.length === 0 || genresInclusive.includes(movie.genre);

    const matchesExcludeGenre =
      genresExclusive.length === 0 || !genresExclusive.includes(movie.genre);

    const matchesRating =
      (ratingFrom === null || movie.rating >= ratingFrom) &&
      (ratingTo === null || movie.rating <= ratingTo);

    const matchesYear =
      (yearFrom === null || movie.year >= yearFrom) &&
      (yearTo === null || movie.year <= yearTo);

    return (
      matchesSearch &&
      matchesIncludeGenre &&
      matchesExcludeGenre &&
      matchesRating &&
      matchesYear
    );
  });
}