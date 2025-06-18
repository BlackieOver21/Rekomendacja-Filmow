'use client';

import { Button, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import styles from "./settings.module.css";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState } from "react";
import UserAuth from "@/utils/auth";
import { useRouter } from "next/navigation";
import { fetchFromAPI, FetchMethod } from "@/utils/utils"; 



const handleDelete = async (password, confirmationText, token, auth) => {

    if (confirmationText !== "Delete my account") {
        alert('Please type “Delete my account” exactly.');
        return;
    }

    try {
        const { success, error } = await fetchFromAPI(
        "/user/delete",
        FetchMethod.DELETE,
        { Authorization: `Bearer ${token}` },
        { password: password }
        );

        if (!success) {
        alert(`Failed to delete account: ${error}`);
        return;
        }

        alert('Your account and data were deleted.');
        auth.logout();
    } catch (err) {
        throw new Error(err.message);
    } 
}

    const handleChangePassword = async (oldPassword, newPassword, repeatNewPassword, token, auth) => {

    if (!oldPassword || !newPassword) {
        return { success: false, error: "Missing fields" };
    }

    if (newPassword !== repeatNewPassword) {
        return { success: false, error: "Password mismatch" };
    }

    try {
        const res = await fetch("/api/auth/change_password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message);
        }

        auth.setToken(data.access_token);
        return { success: true };
    } catch (err) {
        throw new Error(err.message);
    }
}

const handlePurgeAccount = async (password, confirmationText, token, auth) => {

        if (confirmationText !== "Delete all my data") {
            alert('Please type “Delete all my data” exactly.');
            return;
        }

        try {
            const { success, error } = await fetchFromAPI(
            "/user/purge",
            FetchMethod.DELETE,
            { Authorization: `Bearer ${token}` },
            { password: password }
            );

            if (!success) {
            alert(`Failed to purge account: ${error}`);
            return;
            }

            alert("Your account and all associated data have been permanently deleted.");
            auth.logout();
        } catch (err) {
        throw new Error(err.message);
        }
        }

export default function Settings() {
  const [delPassword, setDelPassword] = useState('');
  const [purPassword, setPurPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [confirmationText2, setConfirmationText2] = useState('');

  const auth = new UserAuth();
  const router = useRouter();
  const token = auth.getToken();


  return (
    <div className={styles.containersWrapper}>
      <div>
        <Title className={styles.title}>
          Change password
        </Title>
        <div className={styles.formWrapper}>
          <Paper withBorder shadow="md" p={30} w={420} radius="md" className={styles.container}>
            <PasswordInput label="Old password" value={oldPassword} onChange={e => setOldPassword(e.currentTarget.value)} />
            <PasswordInput label="New password" mt="md" value={newPassword} onChange={e => setNewPassword(e.currentTarget.value)} />
            <PasswordInput label="Repeat new password" mt="md" value={repeatNewPassword} onChange={e => setRepeatNewPassword(e.currentTarget.value)} />
          </Paper>
          <Button
            rightSection={<IconArrowNarrowRight/>}
            onClick={async () => {
                try {
                  const result = await handleChangePassword(oldPassword, newPassword, repeatNewPassword, token, auth);
                  if (result) { router.push('/recommended'); } else { alert('Failed: ' + result.error); } } catch (e) { alert('Error: ' + e.message);}}
            }>
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
            <PasswordInput label="Password" value={purPassword} onChange={e => setPurPassword(e.currentTarget.value)}/>
            <TextInput label="Type in “Delete all my data”" mt="md" value={confirmationText} onChange={e => setConfirmationText(e.currentTarget.value)}/>
          </Paper>
          <Button
            variant="filled"
            color="red.9"
            rightSection={<IconArrowNarrowRight/>}
            onClick={async () => {
                try {
                  const result = await handlePurgeAccount(purPassword, confirmationText, token, auth);
                  if (result) {} else { alert('Failed: ' + result.error); } } catch (e) { alert('Error: ' + e.message); }
            }}>
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
            <PasswordInput label="Password" value={delPassword} onChange={e => setDelPassword(e.currentTarget.value)}/>
            <TextInput label="Type in “Delete my account”" mt="md" value={confirmationText2} onChange={e => setConfirmationText2(e.currentTarget.value)}/>
          </Paper>
          <Button
            variant="filled"
            color="red.9"
            rightSection={<IconArrowNarrowRight/>}
            onClick={async () => {
                handleDelete(delPassword, confirmationText2, token, auth)
                .then(() => {
                  router.push('/recommended');
                })
                .catch((e) => {
                  alert('Error: ' + e.message);
                });
            }}>
            Delete my account
          </Button>
        </div>
      </div>
    </div>
  );
}