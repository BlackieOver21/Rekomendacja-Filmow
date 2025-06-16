//'use client';

import { useState, useEffect, useCallback } from 'react';
import { filterMovies } from '@/utils/filter';
import {
  SimpleGrid,
  Card,
  Text,
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
  BackgroundImage,
  Divider,
} from '@mantine/core';
import { IconSearch, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { defaultUser } from '@/storage/storage';
import UserAuth from '@/utils/auth';
import Link from 'next/link';
import style from "./movieList.module.css";
import { IconStarFilled } from '@tabler/icons-react';
import { fetchFromAPI, FetchMethod } from '@/utils/utils';
import { IconX } from '@tabler/icons-react';
import { IconCheck } from '@tabler/icons-react';

export default function MovieList(props) {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [user, setUser] = useLocalStorage(defaultUser);
  const batchSize = 12;

  const [start, setStart] = useState(0);
  const auth = new UserAuth();

  const fetchMovies = useCallback(async (startIndex) => {
    try {
      const { success, data } = await fetchFromAPI(
        `/${props.endpoint}?start=${startIndex}&end=${startIndex + batchSize}`,
        FetchMethod.GET,
        (props.endpoint !== 'movies') ? { "Authorization": `Bearer ${auth.getToken()}` } : {}
      );
      
      if (!success) throw new Error('Failed to fetch movies');

      // Append new movies
      setMovies((prev) => {
        // Avoid duplicates in case API returns overlapping data
        const newMovies = data.filter(m => !prev.some(pm => pm.id === m.id));
        return [...prev, ...newMovies];
      });

      // Update start only after successful fetch
      setStart(startIndex + batchSize);
    } 
    catch (error) {
      console.error(error);
    }
  }, [user, props, batchSize, auth, setMovies, setStart]);

  // Fetch first batch only once on mount
  useEffect(() => {
    fetchMovies(0);
  }, []);

  const loadMore = useCallback(() => {
    fetchMovies(start);
  }, [fetchMovies, start]);

  return (
    <Flex direction="column" justify="center" align="center" h="100%" gap="sm" >
      <FiltersAndSearch 
        setFilteredMovies={setFilteredMovies}
        movies={movies}
      />

      <Flex direction="column" align="center" justify="center" gap="md" mb="xl" mt="md">
        {filteredMovies.length === 0 ? (
          <Text>No movies match your filters.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" >
            {filteredMovies.map((movie) => (
              <MoviePoster movie={movie} key={movie.id}/>
            ))}
          </SimpleGrid>
        )}

        <Button mt="xl" onClick={loadMore}>Load More</Button>
      </Flex>
    </Flex>
  );
}

function FiltersAndSearch({ setFilteredMovies, movies }) {
  const [opened, setOpened] = useState(false);
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
  });

  // Apply filters whenever movies or filters change
  useEffect(() => {
    const filtered = filterMovies(movies, filters);
    setFilteredMovies(filtered);
  }, [movies, filters, setFilteredMovies]);

  return (
    <>
      <TextInput
        value={filters.search}
        onChange={(event) => {
          const value = event?.currentTarget?.value ?? '';
          setFilters(prev => ({ ...prev, search: value }));
        }}
        placeholder="Search titles"
        w="55%"
        size="sm"
        mt={48}
        mb={8}
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
          <Flex gap={4} align='center'><Text pt={4}>Filters</Text> 
            <>{opened ? <IconChevronUp size={16}/> : <IconChevronDown size={16} />}</>
          </Flex>
        </Button>

        <Collapse w="100%" in={opened}>
          <Divider/>
          <Flex w="100%" gap="0" justify="center">
            <FilterSection
              title="Include"
              filters={filters}
              setFilters={setFilters}
              prefix="Inclusive"
            />
            <Divider orientation='vertical' mr={16} ml={16}/>
            <FilterSection
              title="Exclude"
              filters={filters}
              setFilters={setFilters}
              prefix="Exclusive"
            />
          </Flex>
          <Divider/>
        </Collapse>
      </Flex>
    </>
  );
}

function MoviePoster({ movie }) {
  return (
    <Link href={`/movie/${movie.id}`}>
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
  );
}

function FilterSection({
  title,
  filters,
  setFilters,
  prefix, // to distinguish inclusive/exclusive keys, e.g. 'Inclusive' or 'Exclusive'
}) {
  const genresKey = `genres${prefix}`;
  const ratingFromKey = `ratingFrom${prefix}`;
  const ratingToKey = `ratingTo${prefix}`;
  const yearFromKey = `yearFrom${prefix}`;
  const yearToKey = `yearTo${prefix}`;

  const handleNumberChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? null : value,
    }));
  }, [setFilters]);

  return (
    <Box w="50%" mt={12} mb={16}>
      <Title align="center" order={3}>{title}</Title>
      <Stack mt="md" spacing="sm" align="center">
        <Flex gap="xs" justify="flex-start" align="center" wrap="nowrap">
          <NumberInput
            label="Rating"
            min={1}
            max={5}
            placeholder='1'
            value={filters[ratingFromKey]}
            onChange={(val) => handleNumberChange(ratingFromKey, val)}
            hideControls
            w={45}
          />
          <span style={{marginTop: 28}}>-</span>
          <NumberInput
            label=" "
            min={1}
            max={5}
            placeholder='5'
            value={filters[ratingToKey]}
            onChange={(val) => handleNumberChange(ratingToKey, val)}
            hideControls
            w={45}
          />
          <Divider orientation='vertical' mr={16} ml={16}/>
          <NumberInput
            label="Year"
            placeholder='1894'
            value={filters[yearFromKey]}
            onChange={(val) => handleNumberChange(yearFromKey, val)}
            hideControls
            w={60}
          />
          <span style={{marginTop: 28}}>-</span>
          <NumberInput
            label=" "
            placeholder='2025'
            value={filters[yearToKey]}
            onChange={(val) => handleNumberChange(yearToKey, val)}
            hideControls
            w={60}
          />
        </Flex>

        <Chip.Group
          size="xs"
          multiple
          value={filters[genresKey] || []}
          onChange={(val) => setFilters(prev => ({ ...prev, [genresKey]: val }))}
        >
          <Group justify="center" mt="md" wrap="wrap" gap={8}>
            {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Noire', 'Thriller'].map((genre) => (
              <Chip size="xs" key={genre} value={genre} icon={(prefix === "Exclusive") ? <IconX size={14}/> : <IconCheck size={14}/>}><span className={style.bigChip}>{genre}</span></Chip>
            ))}
          </Group>
        </Chip.Group>
      </Stack>
    </Box>
  );
};