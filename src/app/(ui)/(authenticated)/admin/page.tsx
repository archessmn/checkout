"use client";

// import { getServerAuthSession } from "@/server/auth";
import { Button } from "@mantine/core";
import { MantineSayHello } from "./mantine-form";
import { api } from "@/trpc/react";
import { notifications } from "@mantine/notifications";

export default function Page() {
  // const hello = await api.post.hello.query({ text: "from tRPC" });
  // const session = await getServerAuthSession();

  const deleteFutureActivities =
    api.activity.deleteFutureActivities.useMutation();

  return (
    <>
      <MantineSayHello />
      <Button
        onClick={async () => {
          const deletedResponse = await deleteFutureActivities.mutateAsync();

          if (deletedResponse.ok) {
            notifications.show({
              title: "Success",
              message:
                deletedResponse.count > 0
                  ? `Deleted ${deletedResponse.count} new events.`
                  : "No new events added",
            });
          }
        }}
        color="red"
      >
        Delete Future Events
      </Button>
    </>
  );
}
