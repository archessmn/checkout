import { Group } from "@mantine/core";
import { DemoNotification } from "../_components/notifications";
import { DownloadUserscript } from "../_components/download-userscript";

export default async function Home() {
  return (
    <Group>
      <DemoNotification />
      <DownloadUserscript />
    </Group>
  );
}
