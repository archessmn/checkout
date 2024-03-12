import { Button, Group } from "@mantine/core";
import { DemoNotification } from "../_components/notifications";
import { DownloadUserscript } from "../_components/download-userscript";
import Link from "next/link";

export default async function Home() {
  return (
    <Group>
      {/* <DemoNotification /> */}
      <Button href="/docs/userscript" component={Link}>
        Extension Docs
      </Button>
    </Group>
  );
}
