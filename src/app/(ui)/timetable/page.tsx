"use client";

import { api } from "@/trpc/react";
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
import { useState } from "react";
import { CodeSubmitForm } from "./form";
import { notifications } from "@mantine/notifications";

export default function TimetablePage() {
  const events = api.activity.getDayActivities.useQuery({
    date: moment().format("YYYY-MM-DD"),
  });

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [modalActivity, setModalActivity] = useState<string | null>(null);

  return (
    <>
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalActivity(null);
          closeModal();
        }}
        title="Code Submission"
        centered
      >
        <CodeSubmitForm activityId={modalActivity!} onFormSubmit={closeModal} />
      </Modal>
      <Stack>
        {events.data?.map((event) => {
          const isCurrent =
            moment(event.startDateTime) < moment() &&
            moment(event.endDateTime) > moment();

          return (
            <Card key={crypto.randomUUID()}>
              <Group>
                <Text w={140} c={isCurrent ? "" : "dimmed"}>
                  {moment(event.startDateTime).format("HH:mm")}
                  {" - "}
                  {moment(event.endDateTime).format("HH:mm")}
                </Text>
                <Stack>
                  <Text>{event.reference}</Text>
                  <CopyButton value={event.id}>
                    {({ copied, copy }) => (
                      <UnstyledButton
                        color={copied ? "violet" : "dimmed"}
                        c={copied ? "" : "dimmed"}
                        onClick={() => {
                          copy();
                          notifications.show({
                            message: "Copied to clipboard",
                            color: "green",
                            autoClose: 500,
                          });
                        }}
                        size="compact-sm"
                        variant="transparent"
                      >
                        {event.id}
                      </UnstyledButton>
                    )}
                  </CopyButton>
                </Stack>
                {isCurrent && (
                  <Button
                    variant="filled"
                    color="grape"
                    ml={"auto"}
                    onClick={() => {
                      setModalActivity(event.id);
                      openModal();
                    }}
                  >
                    Submit Code
                  </Button>
                )}
              </Group>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
