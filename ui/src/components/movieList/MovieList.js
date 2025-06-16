//'use client';

import { useState, useEffect } from 'react';
import { filterMovies } from '@/app/utils/filter';
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Container,
  TextInput,
  Collapse,
  Button,
  Box,
  Flex,
  Title,
  NumberInput,
  Chip,
  Group,
  Stack,
  Rating,
  List,
  PasswordInput,
  BackgroundImage,
} from '@mantine/core';
import { IconSearch, IconChevronDown, IconChevronUp, IconGalaxy } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { defaultUser } from '@/storage/storage';
import UserAuth from '@/app/utils/auth';
import Link from 'next/link';
import style from "./movieList.module.css";
import { IconStarFilled } from '@tabler/icons-react';

const FilterSection = ({
  title,
  filters,
  setFilters,
  prefix, // to distinguish inclusive/exclusive keys, e.g. 'Inclusive' or 'Exclusive'
}) => {
  const genresKey = `genres${prefix}`;
  const ratingFromKey = `ratingFrom${prefix}`;
  const ratingToKey = `ratingTo${prefix}`;
  const yearFromKey = `yearFrom${prefix}`;
  const yearToKey = `yearTo${prefix}`;

  const handleNumberChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  };

  return (
  
    <Box w="50%">
      <Title align="center" order={3}>{title}</Title>
      <Stack mt="md" spacing="sm" align="center">
        <Flex gap="xs" justify="flex-start" align="center" wrap="nowrap">
          <NumberInput
            label="Rating from"
            min={1}
            max={5}
            value={filters[ratingFromKey]}
            onChange={(val) => handleNumberChange(ratingFromKey, val)}
            hideControls
            w={80}
          />
          <p>-</p>
          <NumberInput
            label="Rating to"
            min={1}
            max={5}
            value={filters[ratingToKey]}
            onChange={(val) => handleNumberChange(ratingToKey, val)}
            hideControls
            w={80}
          />
          <NumberInput
            label="Year from"
            value={filters[yearFromKey]}
            onChange={(val) => handleNumberChange(yearFromKey, val)}
            hideControls
            w={100}
          />
          <p>-</p>
          <NumberInput
            label="Year to"
            value={filters[yearToKey]}
            onChange={(val) => handleNumberChange(yearToKey, val)}
            hideControls
            w={100}
          />
        </Flex>

        <Chip.Group
          size="xs"
          multiple
          value={filters[genresKey] || []}
          onChange={(val) => setFilters(prev => ({ ...prev, [genresKey]: val }))}
        >
          <Group justify="center" mt="md" wrap="wrap">
            {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Noire', 'Thriller'].map((genre) => (
              <Chip size="xs" key={genre} value={genre}>{genre}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>
    </Box>
  );
};

export default function MovieList(props) {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    ratingFromInclusive: null,
    ratingToInclusive: null,
    yearFromInclusive: null,
    yearToInclusive: null,
    genresInclusive: [],
    ratingFromExclusive: null,
    ratingToExclusive: null,
    yearFromExclusive: null,
    yearToExclusive: null,
    genresExclusive: [],
    recommended: props.recommended,
  });
  const [opened, setOpened] = useState(false);
  const [user, setUser] = useLocalStorage(defaultUser);
  const batchSize = 12;

  const [start, setStart] = useState(0);
  const auth = new UserAuth();

  async function fetchMovies(startIndex) {
    try {
      const recommendationProp = (props.recommended && user) ? '&user_id=' + user.id : '';
      const headers = (props.endpoint !== 'movies') ? {
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${auth.getToken()}` 
        }
      } : undefined;

      const res = await fetch(
        `http://localhost:5000/api/${props.endpoint}?start=${startIndex}&end=${startIndex + batchSize}${recommendationProp}`,
        headers
      );
      
      if (!res.ok) throw new Error('Failed to fetch movies');
      const data = await res.json();

      // Append new movies
      setMovies((prev) => {
        // Avoid duplicates in case API returns overlapping data
        const newMovies = data.filter(m => !prev.some(pm => pm.id === m.id));
        return [...prev, ...newMovies];
      });

      // Update start only after successful fetch
      setStart(startIndex + batchSize);

    } catch (error) {
      console.error(error);
    }
  }

  // Fetch first batch only once on mount
  useEffect(() => {
    fetchMovies(0);
  }, [user, props, batchSize]);

  // Apply filters whenever movies or filters change
  useEffect(() => {
    // console.log('Movies:', movies);
    // console.log('Filters:', filters);
    const filtered = filterMovies(movies, filters);
    // console.log('Filtered:', filtered);
    setFilteredMovies(filtered);
  }, [movies, filters]);

  const loadMore = () => {
    fetchMovies(start);
  };

  return (
    <>
      <Flex direction="column" justify="center" align="center" h="100%" gap="sm">
        <TextInput
          value={filters.search}
          onChange={(event) => {
            const value = event?.currentTarget?.value ?? '';
            setFilters(prev => ({ ...prev, search: value }));
          }}
          placeholder="Search titles"
          w="55%"
          size="sm"
          mt="lg"
          mb={16}
          leftSection={<IconSearch size={18} color="#71787f" />}
        />

        <Flex direction="column" justify="center" align="center" h="100%" w="100%">
          <Button
            variant="light"
            color="#71787f"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            onClick={() => setOpened(o => !o)}
            mb="sm"
            mx="auto"
          >
            {opened ? <>Filters <IconChevronUp size={16} /></> : <>Filters <IconChevronDown size={16} /></>}
          </Button>

          <Collapse w="100%" in={opened}>
                <Flex w="100%" gap="sm" justify="center">
              <FilterSection
                title="Include Filters"
                filters={filters}
                setFilters={setFilters}
                prefix="Inclusive"
              />
              <FilterSection
                title="Exclude Filters"
                filters={filters}
                setFilters={setFilters}
                prefix="Exclusive"
              />
            </Flex>
          </Collapse>
        </Flex>
          <Flex direction="column" align="center" justify="center" gap="md" mb="xl">
            {filteredMovies.length === 0 ? (
            <Text>No movies match your filters.</Text>
          ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" >
                  {filteredMovies.map((movie) => (
                    <Link key={movie.id} href={`/movie/${movie.id}`}>
                      <Card padding="lg" radius="md" className={style.movieCardWrapper}>
                        <Card.Section className={style.movieCard}>
                          <BackgroundImage src={movie.poster} fit="cover">
                            <div className={style.movieCard}>
                              <div className={style.movieCardInfoWrapper}>
                                <Text className={style.title}>{movie.title}</Text>

                                <div className={style.ratingAndYear}>
                                  <div className={style.alignVertically}>
                                    <Text size="sm" color="dimmed">{movie.rating ?? "-"}</Text> 
                                    <IconStarFilled size={16}/>
                                  </div>
                                  <Text size="sm" color="dimmed">{movie.year}</Text>
                                </div>

                                <div className={style.chipWrapper}>
                                   {movie.genre.map((genre) => (
                                    <Chip size="xxs" key={genre} checked={true} variant='filled'><span className={style.chip}>{genre}</span></Chip>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </BackgroundImage>
                        </Card.Section>
                      </Card>
                    </Link>
                  ))}
                </SimpleGrid>
              )}

            <Button mt="xl" onClick={loadMore}>Load More</Button>
        </Flex>
      </Flex>
    </>
  );
}

