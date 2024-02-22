import { db } from "@/server/db";
import { ModuleList } from "./group-list";
import { Group, Stack } from "@mantine/core";
import { BackButton } from "@/app/_components/back-button";

export default function ModulesPage({
  params,
}: {
  params: { moduleId: string };
}) {
  const groups = db.moduleGroup.findMany({
    where: {
      moduleId: params.moduleId,
    },
    orderBy: {
      groupNumber: "asc",
    },
  });

  return (
    <Stack>
      <Group>
        <BackButton />
      </Group>
      <ModuleList groupsPromise={groups} />
    </Stack>
  );
}
