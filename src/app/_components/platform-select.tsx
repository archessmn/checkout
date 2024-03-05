import { SegmentedControl, Center, VisuallyHidden, Text } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";

export const platformValidator = z.enum(["ios", "android", "desktop"]);

export type Platform = z.infer<typeof platformValidator>;

export type ValidPlatform<T extends string> = T extends Platform ? true : false;

export function PlatformSelect(props: {
  platform: Platform;
  changePlatform: Dispatch<SetStateAction<Platform>>;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      <SegmentedControl
        value={props.platform}
        onChange={(value) => {
          props.changePlatform(value as Platform);
          router.push(`${pathname}?platform=${value as Platform}`);
        }}
        fullWidth
        className={props.className}
        data={[
          {
            value: "ios",
            label: (
              <Center>
                <Text visibleFrom="md">iOS Instructions</Text>
                <Text hiddenFrom="md">iOS</Text>
                <VisuallyHidden>iOS</VisuallyHidden>
              </Center>
            ),
          },
          {
            value: "android",
            label: (
              <Center>
                <Text visibleFrom="md">Android Instructions</Text>
                <Text hiddenFrom="md">Android</Text>
                <VisuallyHidden>Android</VisuallyHidden>
              </Center>
            ),
          },
          {
            value: "desktop",
            label: (
              <Center>
                <Text visibleFrom="md">Desktop Instructions</Text>
                <Text hiddenFrom="md">Desktop</Text>
                <VisuallyHidden>Desktop</VisuallyHidden>
              </Center>
            ),
          },
        ]}
      />
    </>
  );
}
