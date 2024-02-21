"use client";

import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export function DemoNotification() {
  return (
    <Button
      onClick={() =>
        notifications.show({
          title: "Default notification",
          message: "Hey there, your code is awesome! 🤥",
        })
      }
    >
      Show notification
    </Button>
  );
}
