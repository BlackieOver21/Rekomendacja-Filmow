'use client';

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
} from '@mantine/core';
import { IconSearch, IconChevronDown, IconChevronUp, IconGalaxy } from '@tabler/icons-react';

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

export default function MovieList() {
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
  });
  const [opened, setOpened] = useState(false);

  const MOVIES_API_URL = 'http://192.168.94.12:5000/api/movies';

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(MOVIES_API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        setMovies([]);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    const filtered = filterMovies(movies, filters);
    setFilteredMovies(filtered);
  }, [filters, movies]);

  return (
    <Container>
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

        <SimpleGrid cols={4} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          {filteredMovies.map((movie, index) => (
            <a key={index} href={`/movie/${movie.id}`} style={{ cursor: 'pointer', textDecoration: 'none' }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image src={movie.poster} height={180} alt={movie.title} fit="cover" />
                </Card.Section>
                <Text weight={500} size="lg" mt="md">{movie.title}</Text>
                <Text size="sm" color="dimmed">{movie.year} • {movie.genre.join(', ')}</Text>
              </Card>
            </a>
          ))}
        </SimpleGrid>
      </Flex>
    </Container>
  );
}

