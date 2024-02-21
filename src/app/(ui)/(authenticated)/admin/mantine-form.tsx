"use client";

import { TextInput, Checkbox, Button, Group, Box, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { api } from "@/trpc/react";

export function MantineSayHello() {
  const form = useForm({
    initialValues: {
      text: "",
      termsOfService: false,
    },

    validate: zodResolver(z.object({ text: z.string() })),

    // onValuesChange: () => {
    //   form.validate();
    // },
  });

  const sayHello = api.post.hello.useMutation();

  return (
    <Box maw={340} mx="auto">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          form.validate();
          if (form.isValid()) {
            const result = await sayHello.mutateAsync({
              text: form.values.text,
            });
            notifications.show({
              title: result.greeting,
              message: (
                <>
                  <Text>Top Text</Text>
                  <Text>Switch Text</Text>
                  <Text>Bottom Text</Text>
                </>
              ),
            });
          }
        }}
      >
        <TextInput
          withAsterisk
          label="Text"
          placeholder="Your text here..."
          {...form.getInputProps("text")}
          onInput={() => form.validateField("text")}
        />

        <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          {...form.getInputProps("termsOfService", { type: "checkbox" })}
        />

        <Group justify="flex-end" mt="md">
          <Button type="submit" disabled={!form.values.termsOfService}>
            Submit
          </Button>
        </Group>
      </form>
    </Box>
  );
}
