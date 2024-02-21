"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type TRPCClientError,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

import { type AppRouter } from "@/server/api/root";
import { getUrl, transformer } from "./shared";

export const api = createTRPCReact<AppRouter>();

interface IError {
  code: number;
  message: string;
  data: any;
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            onError: (error: unknown) => {
              const errors = JSON.parse(
                (error as { message: string }).message,
              ) as TRPCClientError<IError>[];

              for (const error of errors) {
                notifications.show({
                  title: "An error occurred",
                  message: error.message,
                  autoClose: 2000,
                  color: "red",
                });
              }
            },
          },
          queries: {
            onError: (error: unknown) => {
              const errors = JSON.parse(
                (error as { message: string }).message,
              ) as TRPCClientError<IError>[];

              for (const error of errors) {
                notifications.show({
                  title: "An error occurred",
                  message: error.message,
                  autoClose: 2000,
                  color: "red",
                });
              }
            },
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: getUrl(),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
