"use client";

import { groupSchema } from "@/server/api/schemas/group";
import { moduleSchema } from "@/server/api/schemas/module";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { use } from "react";
import { z } from "zod";

export function ModuleList({
  groupsPromise,
}: {
  groupsPromise: Promise<z.infer<typeof groupSchema.db.findOne>[]>;
}) {
  const groups = use(groupsPromise);

  const router = useRouter();
  const pathname = usePathname();

  return (
    <Stack>
      {groups.map((group) => {
        return (
          <Card key={group.id}>
            <Group>
              <Text>{group.groupNumber}</Text>
              <Button
                ml={"auto"}
                onClick={() => {
                  router.push(`${pathname}/${group.id}/activities`);
                }}
              >
                View Activities
              </Button>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
