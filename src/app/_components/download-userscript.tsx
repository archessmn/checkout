"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Link from "next/link";

export function DownloadUserscript() {
  return (
    <Button
      href="/api/userscript.js?download=true"
      component={Link}
      onClick={() => {
        notifications.show({
          message: "Downloading File",
        });
      }}
    >
      Download Userscript
    </Button>
  );
}
