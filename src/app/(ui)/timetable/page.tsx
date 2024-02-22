import { api } from "@/trpc/server";
import {
  Button,
  Card,
  CopyButton,
  Group,
  Modal,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import moment from "moment";
import { Suspense, useState } from "react";
import { CodeSubmitForm } from "../../_components/code-submit-form";
import { notifications } from "@mantine/notifications";
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
      <DayNavigation />
      <Suspense fallback={<LoadingSkeleton />}>
        <EventList events={events} />
      </Suspense>
    </Stack>
  );
}