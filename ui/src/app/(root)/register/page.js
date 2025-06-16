'use client';

import { Button, Container, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./register.module.css";
import { useState } from "react";
import UserAuth from "@/utils/auth";
import { useRouter } from 'next/navigation';

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const auth = new UserAuth();
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await auth.register(username, password);
      router.push('/recommended'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center" className={styles.title}>
        Create an account
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.container}>
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordInput
          label="Password"
          mt="md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          label="Repeat password"
          mt="md"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
        />
        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
        <Button
          fullWidth
          mt="xl"
          loading={loading}
          onClick={handleRegister}
        >
          Sign up
        </Button>
      </Paper>
    </Container>
  );
}