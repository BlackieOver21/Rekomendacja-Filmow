export function filterMovies(movies, filters) {
  const {
    search = '',
    ratingFromInclusive,
    ratingToInclusive,
    yearFromInclusive,
    yearToInclusive,
    genresInclusive,
    ratingFromExclusive,
    ratingToExclusive,
    yearFromExclusive,
    yearToExclusive,
    genresExclusive,
  } = filters;

  return movies.filter((movie) => {
    const movieGenres = Array.isArray(movie.genre)
      ? movie.genre
      : movie.genre.split(',').map(g => g.trim()); // ensure array

    if (search && !movie.title.toLowerCase().includes(search.toLowerCase())) return false;

    if (genresInclusive.length > 0) {
      const matchesInclusive = movieGenres.some(g => genresInclusive.includes(g));
      if (!matchesInclusive) return false;
    }

    if (ratingFromInclusive != null && movie.rating < ratingFromInclusive) return false;
    if (ratingToInclusive != null && movie.rating > ratingToInclusive) return false;

    if (yearFromInclusive != null && movie.year < yearFromInclusive) return false;
    if (yearToInclusive != null && movie.year > yearToInclusive) return false;

    // --- Exclusive filters ---

    if (genresExclusive.length > 0) {
      const matchesExclusive = movieGenres.some(g => genresExclusive.includes(g));
      if (matchesExclusive) return false;
    }

    if (
      ratingFromExclusive != null &&
      ratingToExclusive != null &&
      movie.rating >= ratingFromExclusive &&
      movie.rating <= ratingToExclusive
    ) return false;
    
    if (
      yearFromExclusive != null &&
      yearToExclusive != null &&
      movie.year >= yearFromExclusive &&
      movie.year <= yearToExclusive
    ) return false;

    return true;
  });
}