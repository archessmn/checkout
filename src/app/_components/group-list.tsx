"use client";

import type { groupSchema } from "@/server/api/schemas/group";
import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import { use } from "react";
import type { z } from "zod";

export function GroupList({
  groupsPromise,
}: {
  groupsPromise: Promise<z.infer<typeof groupSchema.db.findOne>[]>;
}) {
  const groups = use(groupsPromise);

  const router = useRouter();

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
                  router.push(`/groups/${group.id}/activities`);
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
