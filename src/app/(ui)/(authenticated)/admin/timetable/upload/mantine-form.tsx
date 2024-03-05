"use client";

import { Button, Group, Box, FileInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { api } from "@/trpc/react";
import { useState } from "react";

export function TimetableUploadForm() {
  const form = useForm({
    initialValues: {
      file: null,
    },

    validate: zodResolver(
      z.object({
        file: z.any(),
      }),
    ),
  });

  const sayHello = api.activity.postTimetableCsv.useMutation();
  const [value, setValue] = useState<File | null>(null);

  return (
    <Box maw={340} mx="auto">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          form.validate();
          if (value?.name) {
            const text = await value?.text();

            const result = await sayHello.mutateAsync({
              filename: value?.name,
              file: text,
            });
            notifications.show({
              title: "Success",
              message:
                result.count > 0
                  ? `Added ${result.count} new events.`
                  : "No new events added",
            });
          }
        }}
      >
        <FileInput
          label="File"
          value={value}
          accept="text/csv"
          onChange={async (payload) => {
            setValue(payload);
          }}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}
