"use client";

import {
  Center,
  type MantineColorScheme,
  SegmentedControl,
  VisuallyHidden,
  useMantineColorScheme,
} from "@mantine/core";
import { LuLaptop, LuMoon, LuSun } from "react-icons/lu";
import { twMerge } from "tailwind-merge";

export function ThemeSwitcher(props: { className: string }) {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={(value) => setColorScheme(value as MantineColorScheme)}
      className={twMerge("w-full", props.className)}
      data={[
        {
          value: "light",
          label: (
            <Center>
              <LuSun className="scale-150" aria-label="light mode" />
              <VisuallyHidden>Light Mode</VisuallyHidden>
            </Center>
          ),
        },
        {
          value: "auto",
          label: (
            <Center>
              <LuLaptop className="scale-150" aria-label="auto mode" />
              <VisuallyHidden>Auto Mode</VisuallyHidden>
            </Center>
          ),
        },
        {
          value: "dark",
          label: (
            <Center>
              <LuMoon className="scale-150" aria-label="dark mode" />
              <VisuallyHidden>Dark Mode</VisuallyHidden>
            </Center>
          ),
        },
      ]}
    />
  );
}
