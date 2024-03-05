"use client";

import { Space } from "@mantine/core";
import { useState } from "react";
import {
  AndroidInstructions,
  DesktopInstructions,
  IOSInstructions,
} from "./platform-instructions";
import {
  type Platform,
  PlatformSelect,
  platformValidator,
} from "@/app/_components/platform-select";

export default function UserscriptDocs({
  searchParams,
}: {
  searchParams: { platform?: string };
}) {
  let platform: Platform = "desktop";

  const searchParamsPlatform = searchParams.platform;
  if (platformValidator.safeParse(searchParamsPlatform).success) {
    // console.log(searchParamsPlatform as Platform);
    platform = platformValidator.parse(searchParamsPlatform) as Platform;
  }

  const [platformChoice, setPlatformChoice] = useState<Platform>(platform);
  return (
    <>
      <PlatformSelect
        platform={platformChoice}
        changePlatform={setPlatformChoice}
      />
      <Space h={"lg"} />
      {platformChoice === "ios" && <IOSInstructions />}
      {platformChoice === "android" && <AndroidInstructions />}
      {platformChoice === "desktop" && <DesktopInstructions />}
      <Space h={"lg"} />
    </>
  );
}
