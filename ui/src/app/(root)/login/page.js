'use client';

import { Button, Container, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./login.module.css";
import { useState } from 'react';
import { redirect } from "next/navigation";
import UserAuth from "@/app/utils/auth";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  let path = '';

  const handleLogin = async () => {
    const auth = new UserAuth();
    try {
      const user = await auth.login(username, password);
      console.log("User logged in:", user);

      path = "/recommended";
    } catch (error) {
      console.error("Login failed:", error.message);
      path = '/login';
    } finally {
      redirect(path);
      // Optionally, you can clear the input fields after login attempt
    }
  }
  return (
    <Container size={420} my={80}>
      <Title ta="center" className={styles.title}>
        Welcome back
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.container}>
        <TextInput label="Username" onChange={(event) => setUsername(event.currentTarget.value)}/>
        <PasswordInput label="Password" mt="md" onChange={(event) => setPassword(event.currentTarget.value)}/>
        <Button fullWidth mt="xl" onClick={() => {handleLogin()}}>
          Log in
        </Button>
      </Paper>
    </Container>
  );
}