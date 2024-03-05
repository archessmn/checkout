import { api } from "@/trpc/server";
import { Center, Stack, Title } from "@mantine/core";
import moment from "moment";
import { Suspense } from "react";
import { EventList } from "../../_components/event-list";
import { LoadingSkeleton } from "@/app/_components/loading";
import { DayNavigation } from "@/app/_components/day-navigation";

export default function TimetablePage({
  searchParams,
}: {
  searchParams?: { date: string };
}) {
  const events = api.activity.getDayActivities.query({
    date: moment(searchParams?.date).format("YYYY-MM-DD"),
  });

  return (
    <Stack>
      <Center>
        <Title>
          {moment(searchParams?.date ?? Date()).format("dddd Mo MMMM YYYY")}
        </Title>
      </Center>
      <Center>
        <DayNavigation />
      </Center>
      <Suspense fallback={<LoadingSkeleton />}>
        <EventList events={events} />
      </Suspense>
    </Stack>
  );
}
