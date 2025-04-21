'use client';

import { Button, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./settings.module.css";
import { IconArrowNarrowRight } from "@tabler/icons-react";

export default function Settings() {
  return (
    <div className={styles.containersWrapper}>
      <div>
        <Title className={styles.title}>
          Change password
        </Title>
        <div className={styles.formWrapper}>
          <Paper withBorder shadow="md" p={30} w={420} radius="md" className={styles.container}>
            <PasswordInput label="Old password"/>
            <PasswordInput label="New password" mt="md" />
            <PasswordInput label="Repeat new password" mt="md" />
          </Paper>
          <Button
            rightSection={<IconArrowNarrowRight/>}
            onClick={() => {/* TODO change password */}}>
            Change password
          </Button>
        </div>
      </div>

      <div>
        <Title className={styles.title}>
          Reset profile data
        </Title>
        <div className={styles.formWrapper}>
          <Paper withBorder shadow="md" p={30} w={420} radius="md" className={styles.container}>
            <PasswordInput label="Password"/>
            <TextInput label="Type in “Delete all my data”" mt="md" />
          </Paper>
          <Button
            variant="filled"
            color="red.9"
            rightSection={<IconArrowNarrowRight/>}
            onClick={() => {/* TODO reset profile data with popup? redirect? */}}>
            Delete my data
          </Button>
        </div>
      </div>

      <div>
        <Title className={styles.title}>
          Delete account
        </Title>
        <div className={styles.formWrapper}>
          <Paper withBorder shadow="md" p={30} w={420} radius="md" className={styles.container}>
            <PasswordInput label="Password"/>
            <TextInput label="Type in “Delete my account”" mt="md" />
          </Paper>
          <Button
            variant="filled"
            color="red.9"
            rightSection={<IconArrowNarrowRight/>}
            onClick={() => {/* TODO delete account and redirect */}}>
            Delete my account
          </Button>
        </div>
      </div>
    </div>
  );
}