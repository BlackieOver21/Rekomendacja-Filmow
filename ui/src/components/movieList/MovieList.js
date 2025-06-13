'use client';

import { useState, useEffect } from 'react';
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
} from '@mantine/core';

import { IconSearch, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { filterMovies } from '@/app/utils/filter';
// import { filterMovies } from '@/app/utils/filter'; // Assuming this is the correct path to your filter function

const FilterSection = ({ title = "Filters", filters, setFilters, genresKey = "genres" }) => {
  return (
    <Box w="50%">
      <Title align="center" order={3}>{title}</Title>
      <Stack mt="md" spacing="sm">
        {/* Rating and year filters can stay the same if shared */}

        <Chip.Group
          size="xs"
          multiple
          value={filters[genresKey] || []}
          onChange={(val) => setFilters(prev => ({ ...prev, [genresKey]: val }))}
        >
          <Group justify="center" mt="md">
            <Chip size="xs" value="Action">Action</Chip>
            <Chip size="xs" value="Adventure">Adventure</Chip>
            <Chip size="xs" value="Comedy">Comedy</Chip>
            <Chip size="xs" value="Drama">Drama</Chip>
            <Chip size="xs" value="Fantasy">Fantasy</Chip>
            <Chip size="xs" value="Noire">Noire</Chip>
            <Chip size="xs" value="Thriller">Thriller</Chip>
          </Group>
        </Chip.Group>
      </Stack>
    </Box>
  );
};

export default function MovieList() {
  
  const [movies, setMovies] = useState([]);
  const [filters, setFilters] = useState({
    ratingFrom: null,
    ratingTo: null,
    yearFrom: null,
    yearTo: null,
    genresInclusive: [], // previously: genres
    genresExclusive: [],
  });
  const [search, setSearch] = useState('');
  const [opened, setOpened] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);

  // Replace this with your real backend URL
  const MOVIES_API_URL = 'http://192.168.94.12:5000/api/movies';

  // Fetch movies from backend
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch(MOVIES_API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
        setMovies([]); // fallback empty
      }
    }

    fetchMovies();
  }, []);

  
  useEffect(() => {
    const filtered = filterMovies(movies, {
      search,
      ...filters,
    });
    setFilteredMovies(filtered);
  }, [search, filters, movies]);
  

  return (
    <Container>
      <Flex direction="column" justify="center" align="center" h="100%" gap="sm">
        <TextInput
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
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
            onClick={() => setOpened((o) => !o)}
            mb="sm"
            mx="auto"
          >
            {opened ? (
              <>
                Filters <IconChevronUp size={16} />
              </>
            ) : (
              <>
                Filters <IconChevronDown size={16} />
              </>
            )}
          </Button>

          <Collapse w="100%" in={opened}>
            <Flex w="100%" gap="sm" justify="center">
              {/* <FilterSection title="Left Side" filters={filters} setFilters={setFilters} />
              <FilterSection title="Right Side" filters={filters} setFilters={setFilters} /> */}
              <FilterSection
                title="Include Genres"
                filters={filters}
                setFilters={setFilters}
                genresKey="genresInclusive"
              />

              <FilterSection
                title="Exclude Genres"
                filters={filters}
                setFilters={setFilters}
                genresKey="genresExclusive"
              />
            </Flex>
          </Collapse>
        </Flex>

        <SimpleGrid cols={4} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          {filteredMovies.map((movie, index) => (
            <a key={index} href={`/movie/${movie.id}`} style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <Card key={index} shadow="sm" padding="lg" radius="md" withBorder
                    href={`/movie/${movie.id}`}
                    style={{ cursor: 'pointer' }}>
                  <Card.Section>
                    <Image src={movie.poster} height={180} alt={movie.title} fit="cover" />
                  </Card.Section>

                  <Text weight={500} size="lg" mt="md">
                    {movie.title}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {movie.year} • {movie.genre}
                  </Text>
                </Card>
            </a>
          ))}
        </SimpleGrid>
      </Flex>
    </Container>
  );
}