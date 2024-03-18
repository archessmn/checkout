"use client";

import {
  Button,
  Card,
  Center,
  Group,
  Modal,
  Stack,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import moment from "moment";
import { use } from "react";

import { BackButton } from "@/app/_components/back-button";
import { CodeSubmitForm } from "@/app/_components/code-submit-form";
import { CodesView } from "@/app/_components/codes-view";

import type { activitySchema } from "@/server/api/schemas/activity";
import type { z } from "zod";

export function ActivityView({
  activityPromise,
}: {
  activityPromise: Promise<z.infer<typeof activitySchema.util.filteredOutput>>;
}) {
  const [
    submitModalOpened,
    { open: openSubmitModal, close: closeSubmitModal },
  ] = useDisclosure(false);

  const activity = use(activityPromise);

  const isCurrent =
    moment(activity.startDateTime) < moment() &&
    moment(activity.endDateTime) > moment();

  return (
    <>
      <Modal
        opened={submitModalOpened}
        onClose={() => {
          closeSubmitModal();
        }}
        title="Code Submission"
        centered
      >
        <CodeSubmitForm
          activityId={activity.id}
          onFormSubmit={closeSubmitModal}
        />
      </Modal>
      <Stack>
        <Group>
          <BackButton />
        </Group>
        <Center>
          <Title>{activity.reference}</Title>
        </Center>
        <Center>
          <Title order={2} c={"dimmed"}>
            {moment(activity.startDateTime).format("dddd Mo MMMM YYYY")}
          </Title>
        </Center>
        <Center>
          <Title order={3} c={"dimmed"}>
            {moment(activity.startDateTime).format("HH:mm")}
            {" - "}
            {moment(activity.endDateTime).format("HH:mm")}
          </Title>
        </Center>
        <Center>
          <Group>
            <Button
              variant="filled"
              color="grape"
              onClick={() => {
                openSubmitModal();
              }}
              disabled={!isCurrent}
            >
              Submit Code
            </Button>
          </Group>
        </Center>
        {activity.checkinCodes.length > 0 ? (
          <Card>
            <Title order={3}>Checkin Codes</Title>
            <CodesView codes={activity.checkinCodes} />
          </Card>
        ) : (
          <Center>
            <Title order={3}>No codes submitted yet :(</Title>
          </Center>
        )}
      </Stack>
    </>
  );
}
