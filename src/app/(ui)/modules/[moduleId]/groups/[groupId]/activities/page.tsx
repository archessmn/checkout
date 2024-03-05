import { api } from "@/trpc/server";
import { Group, Stack } from "@mantine/core";
import moment from "moment";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/app/_components/loading";
import { DayNavigation } from "@/app/_components/day-navigation";
import { EventList } from "@/app/_components/event-list";
import { BackButton } from "@/app/_components/back-button";

export default function TimetablePage({
  searchParams,
  params,
}: {
  searchParams?: { date: string };
  params: { moduleId: string; groupId: string };
}) {
  const events = api.activity.getDayActivities.query({
    date: moment(searchParams?.date).format("YYYY-MM-DD"),
    groupId: params.groupId,
    moduleId: params.moduleId,
  });

  return (
    <Stack>
      <Group>
        <BackButton />
      </Group>
      <DayNavigation />
      <Suspense fallback={<LoadingSkeleton />}>
        <EventList events={events} />
      </Suspense>
    </Stack>
  );
}
