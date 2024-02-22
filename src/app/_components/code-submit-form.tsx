"use client";

import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Box,
  FileInput,
  Textarea,
  NumberInput,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { number, z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { api } from "@/trpc/react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export function CodeSubmitForm({
  activityId,
  onFormSubmit,
}: {
  activityId: string;
  onFormSubmit?: () => any;
}) {
  const form = useForm({
    initialValues: {
      code: null,
    },

    validate: zodResolver(
      z.object({
        code: z.number().max(999999),
      }),
    ),
  });

  const submitCode = api.code.create.useMutation();

  return (
    <Box maw={340} mx="auto">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          form.validate();
          if (form.isValid()) {
            const result = await submitCode.mutateAsync({
              code: form.values.code,
              activityId,
              accepted: false,
            });
            notifications.show({
              title: result.ok
                ? "Code submitted successfully"
                : "Invalid activity",
              message: "Bottom Text.",
              color: result.ok ? "green" : "red",
            });
            if (onFormSubmit) {
              onFormSubmit();
            }
          }
        }}
      >
        <NumberInput label="Checkin Code" {...form.getInputProps("code")} />

        <Group justify="flex-end" mt="md">
          <Button type="submit">Submit</Button>
        </Group>
      </form>
    </Box>
  );
}
