'use client';

import { Button, Container, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./register.module.css";

export default function Register() {
  return (
    <Container size={420} my={80}>
      <Title ta="center" className={styles.title}>
        Create an account
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.container}>
        <TextInput label="Username" />
        <PasswordInput label="Password" mt="md" />
        <PasswordInput label="Repeat password" mt="md" />
        <Button fullWidth mt="xl" onClick={() => {/* TODO login and redirect */}}>
          Sign up
        </Button>
      </Paper>
    </Container>
  );
}