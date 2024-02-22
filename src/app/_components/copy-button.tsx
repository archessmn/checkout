import { CopyButton, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export function CopyButtonWithNotification({ toCopy }: { toCopy: string }) {
  return (
    <CopyButton value={toCopy}>
      {({ copied, copy }) => (
        <UnstyledButton
          color={copied ? "violet" : "dimmed"}
          c={copied ? "" : "dimmed"}
          onClick={() => {
            copy();
            notifications.show({
              message: "Copied to clipboard",
              color: "green",
              autoClose: 1000,
            });
          }}
          size="compact-sm"
          variant="transparent"
        >
          {toCopy}
        </UnstyledButton>
      )}
    </CopyButton>
  );
}
