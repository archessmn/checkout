import { Button, Group } from "@mantine/core";
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
