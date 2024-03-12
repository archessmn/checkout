"use client";

import type { moduleSchema } from "@/server/api/schemas/module";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";
import type { z } from "zod";

export function ModuleList({
  modulesPromise,
}: {
  modulesPromise: Promise<z.infer<typeof moduleSchema.db.findOne>[]>;
}) {
  const modules = use(modulesPromise).sort((a, b) =>
    a.code > b.code ? 1 : -1,
  );

  const pathname = usePathname();
  const router = useRouter();

  return (
    <Stack>
      {modules.map((moduleBeans) => {
        return (
          <Card key={moduleBeans.id}>
            <Group>
              <Text>{moduleBeans.code}</Text>
              <Text>{moduleBeans.description}</Text>
              <Button
                ml={"auto"}
                onClick={() => {
                  router.push(`${pathname}/${moduleBeans.id}/groups`);
                }}
              >
                View Groups
              </Button>
              <Button
                onClick={() => {
                  router.push(`${pathname}/${moduleBeans.id}`);
                }}
              >
                View
              </Button>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
