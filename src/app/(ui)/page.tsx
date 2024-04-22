import { Button, Group } from "@mantine/core";
import Link from "next/link";

export const metadata = {
  title: "Checkout | Home",
  description: "Homepage for the checkout system",
};

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
