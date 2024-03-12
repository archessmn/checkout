import { BackButton } from "@/app/_components/back-button";
import { moduleSchema } from "@/server/api/schemas/module";
import { Center, Group, Stack, Title } from "@mantine/core";
import { use } from "react";
import { z } from "zod";
import { GroupList } from "../../../_components/group-list";

export function ModuleView({
  modulePromise,
}: {
  modulePromise: Promise<z.infer<typeof moduleSchema.db.withGroups>>;
}) {
  const moduleBeans = use(modulePromise);

  return (
    <>
      <Stack>
        <Group>
          <BackButton />
        </Group>
        <Center>
          <Title>{moduleBeans.code}</Title>
        </Center>
        <Center>
          <Title order={2}>{moduleBeans.description}</Title>
        </Center>
        <GroupList
          groupsPromise={(async () => {
            return (await modulePromise).groups;
          })()}
        />
      </Stack>
    </>
  );
}
