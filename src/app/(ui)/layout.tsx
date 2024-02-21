import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { GenericAppShell } from "@/app/_components/app-shell/generic";
import { theme } from "./theme";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <ModalsProvider>
            <TRPCReactProvider>
              <GenericAppShell>{children}</GenericAppShell>
            </TRPCReactProvider>
          </ModalsProvider>
          <Notifications />
        </MantineProvider>
      </body>
    </html>
  );
}
