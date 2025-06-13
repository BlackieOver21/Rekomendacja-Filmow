// "use client";

// import { useEffect, useState } from "react";
// import {
//   Image,
//   Text,
//   Container,
//   Title,
// } from '@mantine/core';

// const Movie = () => {
//   const id = 1;
//   const [movie, setMovie] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//   setLoading(true);
//   fetch(`http://192.168.94.12:5000/api/movies/${id}`)
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return res.json();
//     })
//     .then((data) => {
//       setMovie(data);
//       setLoading(false);
//     })
//     .catch((err) => {
//       setError("Failed to load movie");
//       setLoading(false);
//     });
//   }, [id]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;
//   if (!movie) return <div>Movie not found</div>;

//   return (
//     <Container size="sm">
//       <Title order={2} mt="md">{movie.title} ({movie.year})</Title>
//       <Image src={movie.posterUrl} alt={movie.title} radius="md" mt="md" />
//       <Text mt="md" size="sm" c="dimmed">{movie.genres.join(", ")}</Text>
//       <Text mt="sm">{movie.synopsis}</Text>

//       <Divider my="md" />
//       <Text><strong>Director:</strong> {movie.director}</Text>
//       <Text><strong>Cast:</strong> {movie.cast.join(", ")}</Text>
//       <Text><strong>Duration:</strong> {movie.duration} minutes</Text>
//     </Container>
//   );
// };


// export default Movie;

export default function Movie() {
  return (
    <></>
  );
}