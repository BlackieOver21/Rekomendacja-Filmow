'use client';

import { usePathname } from "next/navigation";
import styles from "./mainHeader.module.css";
import { Button, Grid, Menu, Tabs } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import { IconPlayerPlay } from "@tabler/icons-react";
import { IconSettings } from "@tabler/icons-react";
import { IconLogout } from "@tabler/icons-react";
import { defaultUser } from "@/storage/storage";
import UserAuth from "@/utils/auth";
import { useRouter } from "next/navigation";


const loginButtonBlacklist = ["/login"];
const signUpButtonBlacklist = ["/register", "/recommended"];

const recommendationTabs = ["/movie", "/recommended", "/trending"];

export default function MainHeader() {
  return (
    <Grid gutter={'0px'} className={styles.grid}>
      <Grid.Col span={{ base: 0, sm: 1, md: 1, lg: 1 }} className={styles.gridPadding}/>
      <Grid.Col span={{ base: 12, sm: 10, md: 10, lg: 10 }}>
        <div className={styles.titleButtonsWrapper}>
          <Link href={"/recommended"} className={styles.title}>
            <h3 className={styles.titleText}>MovieRec</h3>
            <h3 className={styles.titleColor}>AI</h3>
          </Link>
          <LoginButtons/>
        </div>
        <TabNavigation/>
      </Grid.Col>
      <Grid.Col span={{ base: 0, sm: 1, md: 1, lg: 1 }} className={styles.gridPadding}/>
    </Grid>
  );
}

function LoginButtons() {
  const path = usePathname();
  const [user, setUser] = useLocalStorage(defaultUser);
  const router = useRouter();
  
  const handleLogout = useCallback(() => {
    const auth = new UserAuth();
    auth.logout();
    setUser(null);
    router.push("/recommended");
  });

  return (
    <div className={styles.loginButtonsWrapper}>
      {user ?
        <Menu
          transitionProps={{ transition: 'pop-top-right' }}
          position="bottom-end"
          width={220}
          withinPortal
        >
          <Menu.Target>
            <Button variant="outline" color="dark" rightSection={<IconChevronDown size={18} stroke={1.5} />} pr={12}>
              {user.username}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Link href={"/profile/watchlist"} passHref>
              <Menu.Item leftSection={<IconPlayerPlay size={16} stroke={1.5} />}>
                Watchlist
              </Menu.Item>
            </Link>
            
            <Link href={"/profile/settings"} passHref>
              <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                Account settings
              </Menu.Item>
            </Link>
            
            <Menu.Item onClick={handleLogout} leftSection={<IconLogout size={16} stroke={1.5} />}>
              Log out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        :
        <>
          {!loginButtonBlacklist.includes(path) && 
            <Link href={"/login"} passHref>
              <Button variant="outline" color="dark">Log in</Button>
            </Link>
          }
          {!signUpButtonBlacklist.includes(path) && 
            <Link href={"/register"} passHref>
              <Button variant="filled">Sign up</Button>
            </Link>
          }
        </>
      }
    </div>
  );
}

function TabNavigation() {
  const path = usePathname();
  const [activeTab, setActiveTab] = useState(path);

  useEffect(() => {
    setActiveTab(path);
  }, [path]);

  return (
    <Tabs variant="outline" value={activeTab} onChange={() => {/* this prevents hydration errors */}}>
      <Tabs.List className={styles.tabList}>
        {recommendationTabs.some((tab) => path.startsWith(tab)) && <>
          <Tab link="/recommended" text="Recommended" activeTab={activeTab}/>
          <Tab link="/trending" text="Trending" activeTab={activeTab}/>
          <Link href='/movie/random'>
            <Button variant="transparent" className={styles.randomMovieButton}>
              Random movie
            </Button>
          </Link>
        </>}
        {path.startsWith("/profile") && <>
          <Tab link="/profile/watchlist" text="Watchlist" activeTab={activeTab}/>
          <Tab link="/profile/watched" text="Rated" activeTab={activeTab}/>
          <Tab link="/profile/settings" text="Settings" activeTab={activeTab}/>
        </>}
      </Tabs.List>
    </Tabs>
  );
}

function Tab({ link, text, activeTab }) {
  return (
    <Link href={link} passHref>
      <Tabs.Tab value={link} className={(activeTab == link) && styles.activeTab}>{text}</Tabs.Tab>
    </Link>
  );
}