'use client';

import { Button, Container, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./login.module.css";

export default function Login() {
  return (
    <Container size={420} my={80}>
      <Title ta="center" className={styles.title}>
        Welcome back
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.container}>
        <TextInput label="Username"/>
        <PasswordInput label="Password" mt="md" />
        <Button fullWidth mt="xl" onClick={() => {/* TODO login and redirect */}}>
          Log in
        </Button>
      </Paper>
    </Container>
  );
}