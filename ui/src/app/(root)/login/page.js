'use client';

import { Button, Container, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./login.module.css";
import { useCallback, useState } from 'react';
import UserAuth from "@/utils/auth";
import { useLocalStorage } from "@mantine/hooks";
import { defaultUser } from "@/storage/storage";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedInUser, setLoggedInUser] = useLocalStorage(defaultUser);
  const router = useRouter();

  const handleLogin = useCallback(() => {
    async function login() {
      const auth = new UserAuth();
      let path = '';
      try {
        const user = await auth.login(username, password);
        // console.log("User logged in:", user);
        setLoggedInUser(user);

        path = "/recommended";
      } catch (error) {
        console.error("Login failed:", error.message);
        path = '/login';
      } finally {
        router.push(path);
        // Optionally, you can clear the input fields after login attempt
      }
    }
    login();
  }, [username, password, setLoggedInUser]); 

  return (
    <Container size={420} my={80}>
      <Title ta="center" className={styles.title}>
        Welcome back
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.container}>
        <TextInput label="Username" onChange={(event) => setUsername(event.currentTarget.value)}/>
        <PasswordInput label="Password" mt="md" onChange={(event) => setPassword(event.currentTarget.value)}/>
        <Button fullWidth mt="xl" onClick={handleLogin}>
          Log in
        </Button>
      </Paper>
    </Container>
  );
}