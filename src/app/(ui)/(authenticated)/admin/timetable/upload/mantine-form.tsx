"use client";

import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Box,
  FileInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { CodeHighlight } from "@mantine/code-highlight";
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

    // onValuesChange: () => {
    //   form.validate();
    // },
  });

  const sayHello = api.activity.postTimetableCsv.useMutation();
  const [value, setValue] = useState<File | null>(null);
  const [fileText, setFileText] = useState<string | null>(null);

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
              message: "Bottom Text.",
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
            const text = await value?.text();
            if (text) {
              setFileText(text);
            }
          }}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}
