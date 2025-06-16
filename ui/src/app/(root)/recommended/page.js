'use client';

import styles from "./recommended.module.css";
import { Button, Text, Title } from "@mantine/core";
import Link from "next/link";
import MovieList from "@/components/movieList/MovieList";
import UserAuth from "@/utils/auth";
import { useEffect, useState } from "react";

export default function Recommended() {
  const auth = new UserAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const result = await auth.isLoggedIn();
      setIsLoggedIn(result);
    };
    checkLogin();
  }, []);

  if (isLoggedIn === null) {
    return <div>Loading...</div>; // or spinner
  }

  return (
    <>{isLoggedIn ?
      <MovieList endpoint='movies/recommended'/>
      :
      <Ad/>
    }</>
  );
}

function Ad() {
  return (
    <div className={styles.root}>
      <Title 
        className={styles.title}
      >
        Get{' '}
        <Text
          component="span"
          inherit
          variant="gradient"
          gradient={{ from: 'paleBlue', to: 'deepBlue' }}
        >
          personalized movie recommendations
        </Text>
        {' '}generated with AI
      </Title>

      <Text className={styles.description}>
        Don't know what to watch next? Our AI can take a look at your watchlist, ratings and current mood - and show you movies perfect for the moment.
        <br/>
        <br/>
        Discover today!
      </Text>

      <div className={styles.buttonWrapper}>
        <Link href={"/register"} passHref>
          <Button>Sign up</Button>
        </Link>
        <Link href={"/trending"} passHref>
          <Button
            variant="subtle"
            color="dark"
          >Show me trending movies first</Button>
        </Link>
        
      </div>
    </div>
  );
}