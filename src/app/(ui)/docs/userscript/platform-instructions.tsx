"use client";

import {
  UserscriptAppStoreIcon,
  UserscriptAppStoreButton,
  UserscriptIcon,
} from "@/app/_components/apple/appstore-userscript-download";
import { DownloadUserscript } from "@/app/_components/download-userscript";
import { Button, Group, List, Stack, Text } from "@mantine/core";
import Link from "next/link";

export function IOSInstructions() {
  return (
    <>
      <Stack>
        <Text size="lg" fw={700}>
          Please note this method only works when you&apos;re using Safari
          (thanks a lot apple).
        </Text>
        <Text>
          One of the easiest ways to use the script is through the{" "}
          <Text
            component="a"
            href="https://apps.apple.com/us/app/userscripts/id1463298887"
            variant="gradient"
            gradient={{
              from: "rgba(20, 200, 255, 1)",
              to: "rgba(20, 150, 255, 1)",
              deg: 60,
            }}
            inherit
          >
            <UserscriptIcon size={18} className="!align-middle" /> Userscripts
            app
          </Text>{" "}
          , an iOS app designed for running custom scripts on websites by using
          a safari extension. There are other ways to run scripts like these but
          these instructions focus specifically on Userscripts. Use the link
          above or the AppStore links below to download the app.
        </Text>
        <Group>
          <UserscriptAppStoreIcon size={48} />
          <UserscriptAppStoreButton scale={50} />
        </Group>

        <Text>
          Head to the AppStore and install the app. Once installed, open the app
          and select &quot;Set Userscripts Directory&quot;. The default
          directory should work just fine, but feel free to choose any one, as
          long as you remember what you chose.
        </Text>
        <DownloadSpiel />
        <Text>
          Once you have downloaded the file &quot;userscript.js&quot;, open up
          the &quot;Files&quot; app and find the downloaded file. It should be
          available from the recents tab at the bottom of the screen, or from
          the &quot;Downloads&quot; folder often found in iCloud Drive. If
          neither of these help, simply search for &quot;userscript.js&quot;.
          Once you have located the file, long press to bring up the menu and
          select &quot;Move&quot;. Navigate to the directory you set for the
          Userscripts app earlier, then confirm with either &quot;Copy&quot; or
          &quot;Move&quot; in the top right corner.
        </Text>
        <Text>
          The last step is to enable the extension for safari. Navigate to
          settings and search for &quot;Extensions&quot;. Locate
          &quot;Userscripts&quot; and allow the extension. Switch back to safari
          and go to the checkin page. Click the puzzle icon in the search bar,
          locate &quot;Userscripts&quot; in the extensions menu, and enable it.
        </Text>
        <Text>
          You can verify the script is working correctly by navigating to the
          checkin page where the title should change to &quot;Check-Out&quot;
          (original I know). I may have forgotten a step so please do let me
          know.
        </Text>
      </Stack>
      <Stack></Stack>
    </>
  );
}

export function AndroidInstructions() {
  return (
    <Text>
      Android Moment (You can install tampermonkey and the steps should be
      similar to the Desktop Instructions. I don&apos;t have an Android device,
      figure it out) (I&apos;m kidding, let me know how you like installing
      scripts and I&apos;ll update this)
    </Text>
  );
}

export function DesktopInstructions() {
  return (
    <Stack>
      <Text>
        One of the easiest ways to use the script is through{" "}
        <Text
          component="a"
          href="https://www.tampermonkey.net/"
          variant="gradient"
          gradient={{
            from: "rgba(20, 200, 255, 1)",
            to: "rgba(20, 150, 255, 1)",
            deg: 60,
          }}
          inherit
        >
          Tampermonkey
        </Text>{" "}
        , a browser extension designed for running custom scripts on websites.
        There are other ways to run scripts like these but these instructions
        focus specifically on Tampermonkey.
      </Text>
      <Text fw={700}>To install Tampermonkey:</Text>
      <List withPadding>
        <List.Item>
          Head to the extension&apos;s website and follow the instructions to
          install it.
        </List.Item>
        <List.Item>
          Navigate to the extension page in your browser by selecting the
          extensions tab in the top right.
        </List.Item>
        <List.Item>Locate Tampermonkey and click dashboard.</List.Item>
      </List>
      <DownloadSpiel />
      <Text fw={700}>Once you have the dashboard open:</Text>
      <List withPadding>
        <List.Item>
          Drag and drop the userscript file onto the dashboard page.
        </List.Item>
        <List.Item>Click install in the prompt that opens.</List.Item>
      </List>
      <Text>
        You can verify the script is working correctly by navigating to the
        checkin page where the title should change to &quot;Check-Out&quot;
        (original I know).
      </Text>
    </Stack>
  );
}

function DownloadSpiel() {
  return (
    <>
      <Text fw={700}>Script downloading and information:</Text>
      <Text>
        Download the{" "}
        <Text
          component="a"
          href="/api/userscript.js?download=true"
          variant="gradient"
          gradient={{
            from: "rgba(20, 200, 255, 1)",
            to: "rgba(20, 150, 255, 1)",
            deg: 60,
          }}
          inherit
        >
          userscript file
        </Text>{" "}
        using the button below or by clicking the previous link. This script
        loads a larger script from this site into the checkin page which then
        provides all the functionality. The reason that the userscript does not
        contain the necessary logic is that loading the main script remotely
        allows any updates to it to happen seamlessly with no further
        interaction needed. If you have any questions or concerns about the
        script you know who to direct them towards. If you are unsure about
        fetching a remote script and running it, you are more than welcome to
        download the latest updated script from{" "}
        <Text
          component="a"
          href="/api/extension.js"
          variant="gradient"
          gradient={{
            from: "rgba(20, 200, 255, 1)",
            to: "rgba(20, 150, 255, 1)",
            deg: 60,
          }}
          inherit
        >
          this site
        </Text>{" "}
        , or from the public github repo, but be aware this will involve extra
        installation steps.
      </Text>
      <DownloadUserscript />
    </>
  );
}
