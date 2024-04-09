"use client";

import type { z } from "zod";
import type { activitySchema } from "@/server/api/schemas/activity";
import { Button, Card, Group, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import moment from "moment";
import { use, useState } from "react";
import { CodeSubmitForm } from "./code-submit-form";
import { CodesView } from "@/app/_components/codes-view";
import { CopyButtonWithNotification } from "@/app/_components/copy-button";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaEye } from "react-icons/fa";
import { MdPassword } from "react-icons/md";

export function EventList({
  events,
}: {
  events: Promise<
    z.infer<typeof activitySchema.getDayActivities.filteredOutput>
  >;
}) {
  const [
    submitModalOpened,
    { open: openSubmitModal, close: closeSubmitModal },
  ] = useDisclosure(false);
  const [codesModalOpened, { open: openCodesModal, close: closeCodesModal }] =
    useDisclosure(false);
  const [modalActivity, setModalActivity] = useState<string | null>(null);

  const finalEvents = use(events);

  const router = useRouter();

  return (
    <>
      <Modal
        opened={submitModalOpened && !codesModalOpened}
        onClose={() => {
          closeSubmitModal();
          setModalActivity(null);
        }}
        title="Code Submission"
        centered
      >
        <CodeSubmitForm
          activityId={modalActivity!}
          onFormSubmit={closeSubmitModal}
        />
      </Modal>
      <Modal
        opened={codesModalOpened && !submitModalOpened}
        onClose={() => {
          closeCodesModal();
          setModalActivity(null);
        }}
        title="View Codes"
        centered
      >
        <CodesView
          codes={
            finalEvents.find((event) => event.id == modalActivity)
              ?.checkinCodes ?? []
          }
        />
      </Modal>
      <Stack>
        {finalEvents.map((event) => {
          const isCurrent =
            moment(event.startDateTime) < moment() &&
            moment(event.endDateTime) > moment();

          return (
            <Card key={event.id}>
              <Group>
                <Text w={140} c={isCurrent ? "" : "dimmed"}>
                  {moment(event.startDateTime).format("HH:mm")}
                  {" - "}
                  {moment(event.endDateTime).format("HH:mm")}
                </Text>
                <Stack gap={"xs"}>
                  <Text>
                    {event.module?.code} - {event.module?.description}
                  </Text>
                  <Text>{event.type}</Text>
                  <Text>{event.reference}</Text>
                  <CopyButtonWithNotification toCopy={event.id} />
                </Stack>
                <Group ml={"auto"}>
                  <Button
                    variant="filled"
                    color="grape"
                    onClick={() => {
                      setModalActivity(event.id);
                      openCodesModal();
                    }}
                    disabled={!(event.checkinCodes.length > 0)}
                    leftSection={<FaEye />}
                  >
                    View Codes
                  </Button>
                  <Button
                    variant="filled"
                    color="grape"
                    onClick={() => {
                      setModalActivity(event.id);
                      openSubmitModal();
                    }}
                    disabled={!isCurrent}
                    leftSection={<MdPassword />}
                  >
                    Submit Code
                  </Button>
                  <Button
                    variant="filled"
                    color="grape"
                    onClick={() => {
                      router.push(`/activities/${event.id}`);
                    }}
                    rightSection={<FaArrowRight />}
                  >
                    View
                  </Button>
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
