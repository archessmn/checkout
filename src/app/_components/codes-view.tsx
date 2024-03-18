"use client";

import {
  Center,
  CopyButton,
  Kbd,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useClipboard, useHotkeys } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { z } from "zod";

const codesSchema = z.array(
  z.object({
    code: z.string(),
    score: z.number(),
  }),
);

export function CodesView({ codes }: { codes: z.infer<typeof codesSchema> }) {
  const clipboard = useClipboard();

  useHotkeys([
    [
      "ctrl+c",
      () => {
        if (codes.length > 0) {
          clipboard.copy(codes[0]?.code);
          notifications.show({
            message: `Copied ${codes[0]?.code} to clipboard`,
            color: "green",
            autoClose: 1000,
          });
        }
      },
    ],
  ]);

  return (
    <>
      {codes.length > 0 ? (
        <Stack>
          <Text>
            Click a code to copy or use <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> to copy
            the code with the highest score
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Code</Table.Th>
                <Table.Th>Score</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {codes.map((code) => {
                const formattedCode = code.code.padStart(6, "0");

                return (
                  <Table.Tr key={code.code}>
                    <Table.Td>
                      <CopyButton value={formattedCode}>
                        {({ copied, copy }) => (
                          <UnstyledButton
                            color={copied ? "violet" : "default"}
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
                            {formattedCode}
                          </UnstyledButton>
                        )}
                      </CopyButton>
                    </Table.Td>
                    <Table.Td>{code.score}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Stack>
      ) : (
        <Center>
          <Text>No codes available for this activity yet</Text>
        </Center>
      )}
    </>
  );
}
