"use client";

import { Button, Card, Center, Space, Title } from "@mantine/core";
import { signIn } from "next-auth/react";

export function SignIn() {
  // signIn("kanidm");

  return (
    <Center h={"100%"}>
      <Card>
        <Title order={2}>Auth needed</Title>
        <Space h={"lg"} />
        <Button onClick={() => signIn("kanidm")}>Sign In</Button>
      </Card>
    </Center>
  );
}
