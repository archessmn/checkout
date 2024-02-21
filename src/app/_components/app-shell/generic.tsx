"use client";

import { AppShell, Burger, Group, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ThemeSwitcher } from "../theme-switcher";
import { LuCalendar, LuHome, LuWrench } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import { use } from "react";

export function GenericAppShell(props: { children: React.ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const pathname = usePathname();

  // const session = use(getSession());

  // console.log(session?.user);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <div>Logo</div>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          component={Link}
          href={"/"}
          leftSection={<LuHome size="1rem" />}
          label="Home"
          onClick={toggleMobile}
          active={pathname === "/"}
        />
        <NavLink
          component={Link}
          href={"/timetable"}
          leftSection={<LuCalendar size="1rem" />}
          label="Timetable"
          onClick={toggleMobile}
          active={pathname === "/timetable"}
        />
        <NavLink
          component={Link}
          href={"/admin"}
          leftSection={<LuWrench size="1rem" />}
          label="Admin Stuff"
          onClick={toggleMobile}
          active={pathname === "/admin"}
        />

        <ThemeSwitcher className={"mt-auto"} />
      </AppShell.Navbar>

      <AppShell.Main>{props.children}</AppShell.Main>
    </AppShell>
  );
}
