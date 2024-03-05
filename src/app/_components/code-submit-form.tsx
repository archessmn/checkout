"use client";

import { Button, Group, Box, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { api } from "@/trpc/react";
import { notifications } from "@mantine/notifications";

export function CodeSubmitForm({
  activityId,
  onFormSubmit,
}: {
  activityId: string;
  onFormSubmit?: () => void;
}) {
  const form = useForm({
    initialValues: {
      code: null,
    },

    validate: zodResolver(
      z.object({
        code: z.preprocess((code) => {
          return typeof code === "number" ? `${code}` : null;
        }, z.string().length(6)),
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
              code: `${form.values.code}`,
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
